<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); // Adjust in production
header("Access-Control-Allow-Credentials: true");
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
    // Get all contacts
    $query = "SELECT id, name, email, phone, notes FROM contacts WHERE user_id = :user_id ORDER BY name ASC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $user['id']);
    $stmt->execute();
    
    $contacts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode(array("success" => true, "contacts" => $contacts));
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Add new contact
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->name)) {
        $query = "INSERT INTO contacts (user_id, name, email, phone, notes) 
                  VALUES (:user_id, :name, :email, :phone, :notes)";
        $stmt = $db->prepare($query);
        
        $name = htmlspecialchars(strip_tags($data->name));
        $email = !empty($data->email) ? htmlspecialchars(strip_tags($data->email)) : null;
        $phone = !empty($data->phone) ? htmlspecialchars(strip_tags($data->phone)) : null;
        $notes = !empty($data->notes) ? htmlspecialchars(strip_tags($data->notes)) : null;
        
        $stmt->bindParam(":user_id", $user['id']);
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":phone", $phone);
        $stmt->bindParam(":notes", $notes);
        
        if ($stmt->execute()) {
            $lastId = $db->lastInsertId();
            http_response_code(201);
            echo json_encode(array(
                "success" => true,
                "message" => "Contact created",
                "id" => $lastId
            ));
        } else {
            http_response_code(503);
            echo json_encode(array("success" => false, "message" => "Unable to create contact"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Missing name"));
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Update contact
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->id)) {
        $query = "UPDATE contacts 
                  SET name = :name, email = :email, phone = :phone, notes = :notes 
                  WHERE id = :id AND user_id = :user_id";
        $stmt = $db->prepare($query);
        
        $name = htmlspecialchars(strip_tags($data->name));
        $email = !empty($data->email) ? htmlspecialchars(strip_tags($data->email)) : null;
        $phone = !empty($data->phone) ? htmlspecialchars(strip_tags($data->phone)) : null;
        $notes = !empty($data->notes) ? htmlspecialchars(strip_tags($data->notes)) : null;
        
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":phone", $phone);
        $stmt->bindParam(":notes", $notes);
        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":user_id", $user['id']);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("success" => true, "message" => "Contact updated"));
        } else {
            http_response_code(503);
            echo json_encode(array("success" => false, "message" => "Unable to update contact"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Missing ID"));
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Delete contact
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->id)) {
        $query = "DELETE FROM contacts WHERE id = :id AND user_id = :user_id";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":user_id", $user['id']);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("success" => true, "message" => "Contact deleted"));
        } else {
            http_response_code(503);
            echo json_encode(array("success" => false, "message" => "Unable to delete contact"));
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