<?php
// Ensure no output before headers
if (ob_get_level() > 0) {
    ob_clean();
}

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); // Adjust in production
header("Access-Control-Allow-Credentials: true");
require_once "../auth/session.php";
require_once "../config/database.php";

try {
    $user = getCurrentUser();

    if (!$user) {
        throw new Exception("Not authenticated");
    }

    $database = new Database();
    $db = $database->getConnection();

    // Initialize performance array
    $performance = [
        'todo' => ['total' => 0, 'completed' => 0],
        'tasks' => ['total' => 0, 'completed' => 0],
        'goals' => ['total' => 0, 'completed' => 0],
        'contacts' => ['total' => 0],
        'timeTracker' => ['focusTime' => 0]
    ];

    // Get performance data with error handling
    $queries = [
        'todo' => "SELECT COUNT(*) as total, SUM(is_completed) as completed FROM todo_items WHERE user_id = :user_id",
        'tasks' => "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed FROM tasks WHERE user_id = :user_id",
        'goals' => "SELECT COUNT(*) as total, SUM(is_completed) as completed FROM goals WHERE user_id = :user_id",
        'contacts' => "SELECT COUNT(*) as total FROM contacts WHERE user_id = :user_id",
        'timeTracker' => "SELECT COALESCE(SUM(duration_seconds), 0) as focusTime FROM time_activities WHERE user_id = :user_id"
    ];

    foreach ($queries as $key => $query) {
        try {
            $stmt = $db->prepare($query);
            $stmt->bindParam(":user_id", $user['id']);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                $performance[$key] = $result;
            }
        } catch (PDOException $e) {
            // Log error but continue with other queries
            error_log("Profile query error ($key): " . $e->getMessage());
        }
    }

    // Build response
    $response = [
        "success" => true,
        "username" => $user['username'] ?? '',
        "email" => $user['email'] ?? '',
        "photo" => $user['profile_photo'] ?? null,
        "performance" => $performance
    ];

    echo json_encode($response);
    exit;

} catch (Exception $e) {
    if (!headers_sent()) {
        http_response_code(401);
    }
    
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
    exit;
}
?>