<?php
require_once '../config.php';

// Handle Status Update (e.g., Mark as Completed)
if (isset($_GET['action']) && $_GET['action'] == 'update_status') {
    $id = $_GET['id'];
    $status = $_GET['status'];
    $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);
    header("Location: index.php");
    exit;
}

// Fetch all orders
 $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
 $orders = $stmt->fetchAll();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Queen Burgers Admin</title>
    <style>
        body { font-family: sans-serif; padding: 20px; background: #f4f4f4; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h2 { color: #E63946; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #333; color: white; }
        .proof-img { width: 80px; height: 80px; object-fit: cover; border-radius: 5px; cursor: pointer; }
        .status-pending { color: orange; font-weight: bold; }
        .status-completed { color: green; font-weight: bold; }
        .btn { padding: 5px 10px; text-decoration: none; color: white; border-radius: 3px; font-size: 0.8rem; }
        .btn-success { background: #28a745; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Queen Burgers - Admin Dashboard</h2>
        
        <?php if (count($orders) > 0): ?>
        <table>
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Payment Proof</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($orders as $order): ?>
                    <!-- Get items for this order -->
                    <?php 
                        $itemStmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
                        $itemStmt->execute([$order['id']]);
                        $items = $itemStmt->fetchAll();
                        $itemsList = implode(", ", array_map(function($i){ return $i['quantity']."x ".$i['item_name']; }, $items));
                    ?>
                    
                    <tr>
                        <td>#<?= $order['id'] ?></td>
                        <td><?= $order['created_at'] ?></td>
                        <td>ETB <?= number_format($order['total_amount'], 2) ?></td>
                        <td>
                            <a href="../uploads/<?= $order['proof_image'] ?>" target="_blank">
                                <img src="../uploads/<?= $order['proof_image'] ?>" class="proof-img" alt="Proof">
                            </a>
                            <br><small><?= $itemsList ?></small>
                        </td>
                        <td class="<?= $order['status'] == 'Pending' ? 'status-pending' : 'status-completed' ?>">
                            <?= $order['status'] ?>
                        </td>
                        <td>
                            <?php if($order['status'] == 'Pending'): ?>
                                <a href="index.php?action=update_status&id=<?= $order['id'] ?>&status=Completed" class="btn btn-success">Mark Paid</a>
                            <?php else: ?>
                                <span style="color:green;">&#10003; Done</span>
                            <?php endif; ?>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <?php else: ?>
            <p>No orders found yet.</p>
        <?php endif; ?>
    </div>
</body>
</html>