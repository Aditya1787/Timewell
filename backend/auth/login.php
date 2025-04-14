<?php
header("Content-Type: application/json");
require_once "../config/database.php";

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT id, username, email, password_hash FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $data->email);
    $stmt->execute();

    if ($stmt->rowCount() == 1) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (password_verify($data->password, $row['password_hash'])) {
            // Create session token
            $session_token = bin2hex(random_bytes(32));
            $expires_at = date("Y-m-d H:i:s", strtotime("+30 days"));
            
            // Store session in database
            $query = "INSERT INTO sessions (user_id, session_token, expires_at) VALUES (:user_id, :session_token, :expires_at)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":user_id", $row['id']);
            $stmt->bindParam(":session_token", $session_token);
            $stmt->bindParam(":expires_at", $expires_at);
            $stmt->execute();
            
            // Set cookie
            setcookie("session_token", $session_token, time() + (86400 * 30), "/"); // 30 days
            
            http_response_code(200);
            echo json_encode(array(
                "message" => "Login successful",
                "success" => true,
                "user" => array(
                    "id" => $row['id'],
                    "username" => $row['username'],
                    "email" => $row['email']
                )
            ));
        } else {
            http_response_code(401);
            echo json_encode(array("message" => "Invalid credentials", "success" => false));
        }
    } else {
        http_response_code(401);
        echo json_encode(array("message" => "User not found", "success" => false));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Missing email or password", "success" => false));
}
?>