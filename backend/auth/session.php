<?php
header("Content-Type: application/json");
require_once "../config/database.php";

function getCurrentUser() {
    if (!isset($_COOKIE['session_token'])) {
        return null;
    }

    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT users.id, users.username, users.email, users.profile_photo 
              FROM users 
              JOIN sessions ON users.id = sessions.user_id 
              WHERE sessions.session_token = :session_token AND sessions.expires_at > NOW()";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":session_token", $_COOKIE['session_token']);
    $stmt->execute();

    if ($stmt->rowCount() == 1) {
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    return null;
}
?>