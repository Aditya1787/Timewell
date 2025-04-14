<?php
header("Content-Type: application/json");
require_once "../auth/session.php";

$user = getCurrentUser();

if (!$user) {
    http_response_code(401);
    echo json_encode(array("success" => false, "message" => "Not authenticated"));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['photo'])) {
    $uploadDir = '../uploads/profile_photos/';
    
    // Create directory if it doesn't exist
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $fileExtension = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
    $fileName = 'user_' . $user['id'] . '_' . time() . '.' . $fileExtension;
    $targetPath = $uploadDir . $fileName;
    
    // Check file type
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!in_array($_FILES['photo']['type'], $allowedTypes)) {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Invalid file type"));
        exit;
    }
    
    // Check file size (max 2MB)
    if ($_FILES['photo']['size'] > 2097152) {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "File too large (max 2MB)"));
        exit;
    }
    
    // Move uploaded file
    if (move_uploaded_file($_FILES['photo']['tmp_name'], $targetPath)) {
        // Update database
        $database = new Database();
        $db = $database->getConnection();
        
        $query = "UPDATE users SET profile_photo = :photo WHERE id = :user_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":photo", $fileName);
        $stmt->bindParam(":user_id", $user['id']);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "message" => "Photo updated successfully",
                "photo" => $fileName
            ));
        } else {
            http_response_code(500);
            echo json_encode(array("success" => false, "message" => "Failed to update database"));
        }
    } else {
        http_response_code(500);
        echo json_encode(array("success" => false, "message" => "Failed to upload file"));
    }
} else {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "No file uploaded"));
}
?>