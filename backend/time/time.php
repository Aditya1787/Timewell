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
    // Get all time activities
    $query = "SELECT id, activity_name, start_time, end_time, duration_seconds 
              FROM time_activities 
              WHERE user_id = :user_id 
              ORDER BY start_time DESC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $user['id']);
    $stmt->execute();
    
    $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode(array("success" => true, "activities" => $activities));
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Start new time activity
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->activity_name)) {
        $query = "INSERT INTO time_activities (user_id, activity_name, start_time) 
                  VALUES (:user_id, :activity_name, NOW())";
        $stmt = $db->prepare($query);
        
        $activity_name = htmlspecialchars(strip_tags($data->activity_name));
        
        $stmt->bindParam(":user_id", $user['id']);
        $stmt->bindParam(":activity_name", $activity_name);
        
        if ($stmt->execute()) {
            $lastId = $db->lastInsertId();
            http_response_code(201);
            echo json_encode(array(
                "success" => true,
                "message" => "Time activity started",
                "id" => $lastId
            ));
        } else {
            http_response_code(503);
            echo json_encode(array("success" => false, "message" => "Unable to start time activity"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Missing activity name"));
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Stop time activity
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->id)) {
        // First get the start time
        $query = "SELECT start_time FROM time_activities WHERE id = :id AND user_id = :user_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":user_id", $user['id']);
        $stmt->execute();
        
        if ($stmt->rowCount() == 1) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $start_time = new DateTime($row['start_time']);
            $end_time = new DateTime();
            $duration = $end_time->getTimestamp() - $start_time->getTimestamp();
            
            // Update the activity
            $query = "UPDATE time_activities 
                      SET end_time = NOW(), duration_seconds = :duration 
                      WHERE id = :id AND user_id = :user_id";
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(":duration", $duration);
            $stmt->bindParam(":id", $data->id);
            $stmt->bindParam(":user_id", $user['id']);
            
            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(array(
                    "success" => true,
                    "message" => "Time activity stopped",
                    "duration" => $duration
                ));
            } else {
                http_response_code(503);
                echo json_encode(array("success" => false, "message" => "Unable to stop time activity"));
            }
        } else {
            http_response_code(404);
            echo json_encode(array("success" => false, "message" => "Activity not found"));
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