<?php
header("Content-Type: application/json");
require_once "../auth/session.php";

$user = getCurrentUser();

if (!$user) {
    http_response_code(401);
    echo json_encode(array("success" => false, "message" => "Not authenticated"));
    exit;
}

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get all to-do items
    $query = "SELECT id, task, is_completed FROM todo_items WHERE user_id = :user_id ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $user['id']);
    $stmt->execute();
    
    $todos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode(array("success" => true, "todos" => $todos));
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Add new to-do item
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->task)) {
        $query = "INSERT INTO todo_items (user_id, task) VALUES (:user_id, :task)";
        $stmt = $db->prepare($query);
        
        $task = htmlspecialchars(strip_tags($data->task));
        
        $stmt->bindParam(":user_id", $user['id']);
        $stmt->bindParam(":task", $task);
        
        if ($stmt->execute()) {
            $lastId = $db->lastInsertId();
            http_response_code(201);
            echo json_encode(array(
                "success" => true,
                "message" => "To-do item created",
                "id" => $lastId
            ));
        } else {
            http_response_code(503);
            echo json_encode(array("success" => false, "message" => "Unable to create to-do item"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Missing task text"));
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Update to-do item (complete/uncomplete)
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->id) && isset($data->is_completed)) {
        $query = "UPDATE todo_items SET is_completed = :is_completed WHERE id = :id AND user_id = :user_id";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(":is_completed", $data->is_completed);
        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":user_id", $user['id']);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("success" => true, "message" => "To-do item updated"));
        } else {
            http_response_code(503);
            echo json_encode(array("success" => false, "message" => "Unable to update to-do item"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Missing required data"));
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Delete to-do item
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->id)) {
        $query = "DELETE FROM todo_items WHERE id = :id AND user_id = :user_id";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":user_id", $user['id']);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("success" => true, "message" => "To-do item deleted"));
        } else {
            http_response_code(503);
            echo json_encode(array("success" => false, "message" => "Unable to delete to-do item"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Missing ID"));
    }
} else {
    http_response_code(405);
    echo json_encode(array("success" => false, "message" => "Method not allowed"));
}
?>