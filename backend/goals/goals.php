<?php
header("Content-Type: application/json");
require_once "../auth/session.php";

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

$user = getCurrentUser();

if (!$user) {
    http_response_code(401);
    echo json_encode(array("success" => false, "message" => "Not authenticated"));
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get all goals
        $query = "SELECT id, title, description, target_date, is_completed 
                  FROM goals 
                  WHERE user_id = :user_id 
                  ORDER BY 
                    CASE WHEN is_completed THEN 1 ELSE 0 END,
                    target_date ASC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":user_id", $user['id']);
        $stmt->execute();
        
        $goals = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode(array("success" => true, "goals" => $goals));
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Add new goal
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['title'])) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Title is required"));
            exit;
        }

        $query = "INSERT INTO goals (user_id, title, description, target_date) 
                  VALUES (:user_id, :title, :description, :target_date)";
        $stmt = $db->prepare($query);
        
        $title = htmlspecialchars(strip_tags($data['title']));
        $description = !empty($data['description']) ? htmlspecialchars(strip_tags($data['description'])) : null;
        $target_date = !empty($data['target_date']) ? $data['target_date'] : null;
        
        $stmt->bindParam(":user_id", $user['id']);
        $stmt->bindParam(":title", $title);
        $stmt->bindParam(":description", $description);
        $stmt->bindParam(":target_date", $target_date);
        
        if ($stmt->execute()) {
            $lastId = $db->lastInsertId();
            http_response_code(201);
            echo json_encode(array(
                "success" => true,
                "message" => "Goal created successfully",
                "id" => $lastId
            ));
        } else {
            http_response_code(500);
            echo json_encode(array(
                "success" => false, 
                "message" => "Database error: " . implode(" ", $stmt->errorInfo())
            ));
        }
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Update goal
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['id'])) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Goal ID is required"));
            exit;
        }

        $query = "UPDATE goals 
                  SET title = :title, 
                      description = :description, 
                      target_date = :target_date, 
                      is_completed = :is_completed 
                  WHERE id = :id AND user_id = :user_id";
        $stmt = $db->prepare($query);
        
        $title = htmlspecialchars(strip_tags($data['title']));
        $description = !empty($data['description']) ? htmlspecialchars(strip_tags($data['description'])) : null;
        $target_date = !empty($data['target_date']) ? $data['target_date'] : null;
        $is_completed = isset($data['is_completed']) ? (bool)$data['is_completed'] : false;
        
        $stmt->bindParam(":title", $title);
        $stmt->bindParam(":description", $description);
        $stmt->bindParam(":target_date", $target_date);
        $stmt->bindParam(":is_completed", $is_completed, PDO::PARAM_BOOL);
        $stmt->bindParam(":id", $data['id']);
        $stmt->bindParam(":user_id", $user['id']);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("success" => true, "message" => "Goal updated successfully"));
        } else {
            http_response_code(500);
            echo json_encode(array(
                "success" => false, 
                "message" => "Database error: " . implode(" ", $stmt->errorInfo())
            ));
        }
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        // Delete goal
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['id'])) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Goal ID is required"));
            exit;
        }

        $query = "DELETE FROM goals WHERE id = :id AND user_id = :user_id";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(":id", $data['id']);
        $stmt->bindParam(":user_id", $user['id']);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("success" => true, "message" => "Goal deleted successfully"));
        } else {
            http_response_code(500);
            echo json_encode(array(
                "success" => false, 
                "message" => "Database error: " . implode(" ", $stmt->errorInfo())
            ));
        }
    } else {
        http_response_code(405);
        echo json_encode(array("success" => false, "message" => "Method not allowed"));
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false, 
        "message" => "Server error: " . $e->getMessage()
    ));
}
?>