<?php
  require_once('conn.php');
  header('Content-type:application/json;charset=utf-8');
  header('Access-Control-Allow-Origin: *');

  if (empty($_POST['todos'])) {
    $json = array(
      'ok' => 'false',
      'message' => 'No todos found.'
    );

    $response = json_encode($json);
    echo $response;
    die();
  }

  $todos = $_POST['todos'];

  $sql = "INSERT INTO saffran_todos (todo_data) VALUES(?)";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param('s', $todos);
  
  $result = $stmt->execute();

  // 如果 query 執行失敗
  if (!$result) {
    $json = array(
      'ok' => 'false',
      'message' => $conn->error
    );

    $response = json_encode($json);
    echo $response;
    die();
  }

  // 如果 query 執行成功
  $json = array(
    'ok' => 'true',
    'message' => 'Success!',
    'id' => $conn->insert_id // 把 id 傳回去
  );

  $response = json_encode($json);
  echo $response;

?>