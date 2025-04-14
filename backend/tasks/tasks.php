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
    // Get all tasks
    $query = "SELECT id, title, description, due_date, priority, status 
              FROM tasks 
              WHERE user_id = :user_id 
              ORDER BY 
                CASE priority 
                    WHEN 'high' THEN 1 
                    WHEN 'medium' THEN 2 
                    WHEN 'low' THEN 3 
                END, 
                due_date ASC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $user['id']);
    $stmt->execute();
    
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode(array("success" => true, "tasks" => $tasks));
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Add new task
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->title)) {
        $query = "INSERT INTO tasks (user_id, title, description, due_date, priority, status) 
                  VALUES (:user_id, :title, :description, :due_date, :priority, :status)";
        $stmt = $db->prepare($query);
        
        $title = htmlspecialchars(strip_tags($data->title));
        $description = !empty($data->description) ? htmlspecialchars(strip_tags($data->description)) : null;
        $due_date = !empty($data->due_date) ? $data->due_date : null;
        $priority = !empty($data->priority) ? $data->priority : 'medium';
        $status = 'not_started';
        
        $stmt->bindParam(":user_id", $user['id']);
        $stmt->bindParam(":title", $title);
        $stmt->bindParam(":description", $description);
        $stmt->bindParam(":due_date", $due_date);
        $stmt->bindParam(":priority", $priority);
        $stmt->bindParam(":status", $status);
        
        if ($stmt->execute()) {
            $lastId = $db->lastInsertId();
            http_response_code(201);
            echo json_encode(array(
                "success" => true,
                "message" => "Task created",
                "id" => $lastId
            ));
        } else {
            http_response_code(503);
            echo json_encode(array("success" => false, "message" => "Unable to create task"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Missing title"));
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Update task
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->id)) {
        // Build dynamic update query
        $updates = array();
        $params = array(':id' => $data->id, ':user_id' => $user['id']);
        
        if (!empty($data->title)) {
            $updates[] = "title = :title";
            $params[':title'] = htmlspecialchars(strip_tags($data->title));
        }
        
        if (isset($data->description)) {
            $updates[] = "description = :description";
            $params[':description'] = !empty($data->description) ? htmlspecialchars(strip_tags($data->description)) : null;
        }
        
        if (!empty($data->due_date)) {
            $updates[] = "due_date = :due_date";
            $params[':due_date'] = $data->due_date;
        }
        
        if (!empty($data->priority)) {
            $updates[] = "priority = :priority";
            $params[':priority'] = $data->priority;
        }
        
        if (!empty($data->status)) {
            $updates[] = "status = :status";
            $params[':status'] = $data->status;
        }
        
        if (count($updates) > 0) {
            $query = "UPDATE tasks SET " . implode(", ", $updates) . " WHERE id = :id AND user_id = :user_id";
            $stmt = $db->prepare($query);
            
            foreach ($params as $key => &$val) {
                $stmt->bindParam($key, $val);
            }
            
            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(array("success" => true, "message" => "Task updated"));
            } else {
                http_response_code(503);
                echo json_encode(array("success" => false, "message" => "Unable to update task"));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "No data to update"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Missing ID"));
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Delete task
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->id)) {
        $query = "DELETE FROM tasks WHERE id = :id AND user_id = :user_id";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":user_id", $user['id']);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("success" => true, "message" => "Task deleted"));
        } else {
            http_response_code(503);
            echo json_encode(array("success" => false, "message" => "Unable to delete task"));
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