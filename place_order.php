<?php
header('Content-Type: application/json');
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 1. Handle File Upload
    if (!isset($_FILES['screenshot']) || $_FILES['screenshot']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['success' => false, 'message' => 'No file uploaded or error uploading.']);
        exit;
    }

    $uploadDir = '../uploads/';
    // Create unique filename
    $fileName = time() . '_' . basename($_FILES['screenshot']['name']);
    $uploadPath = $uploadDir . $fileName;

    if (!move_uploaded_file($_FILES['screenshot']['tmp_name'], $uploadPath)) {
        echo json_encode(['success' => false, 'message' => 'Failed to save file.']);
        exit;
    }

    // 2. Get POST Data
    $data = json_decode(file_get_contents('php://input'), true);
    $cartItems = $data['cart']; // Array of items
    $total = $data['total'];
    $paymentMethod = $data['paymentMethod'];
    $customerName = "Guest Customer"; // You can add a name input field in frontend later

    try {
        $pdo->beginTransaction();

        // Insert into Orders Table
        $stmt = $pdo->prepare("INSERT INTO orders (customer_name, total_amount, payment_method, proof_image) VALUES (?, ?, ?, ?)");
        $stmt->execute([$customerName, $total, $paymentMethod, $fileName]);
        $orderId = $pdo->lastInsertId();

        // Insert Items
        $itemStmt = $pdo->prepare("INSERT INTO order_items (order_id, item_name, quantity, price) VALUES (?, ?, ?, ?)");
        foreach ($cartItems as $item) {
            $itemStmt->execute([$orderId, $item['name'], $item['qty'], $item['price']]);
        }

        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Order placed successfully!']);

    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}
?>