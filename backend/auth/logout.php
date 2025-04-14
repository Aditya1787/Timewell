<?php
// Start output buffering
ob_start();

// Set error reporting to log instead of display
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_log("Logout script started");

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); // Adjust in production
header("Access-Control-Allow-Credentials: true");
require_once "../config/database.php";

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$response = []; // Default response

try {
    // Initialize database connection
    $database = new Database();
    $db = $database->getConnection();
    
    if (isset($_COOKIE['session_token'])) {
        $query = "DELETE FROM sessions WHERE session_token = :session_token";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":session_token", $_COOKIE['session_token']);
        
        if ($stmt->execute()) {
            $_SESSION = [];
            session_destroy();
            
            setcookie("session_token", "", [
                'expires' => time() - 3600,
                'path' => '/',
                'secure' => true,
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
            
            $response = [
                "success" => true,
                "message" => "Logged out successfully"
            ];
        } else {
            throw new Exception("Failed to delete session from database");
        }
    } else {
        $response = [
            "success" => false,
            "message" => "No active session found"
        ];
    }
} catch (Exception $e) {
    error_log("Logout error: " . $e->getMessage());
    $response = [
        "success" => false,
        "message" => "Logout error: " . $e->getMessage()
    ];
    if (!headers_sent()) {
        http_response_code(500);
    }
}

// Ensure JSON is always sent
echo json_encode($response);
ob_end_flush(); // Flush output buffer
exit;
?>