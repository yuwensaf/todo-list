/* eslint-disable quotes */
/* eslint-disable no-undef */
/* eslint-disable no-use-before-define */
/* eslint-disable function-paren-newline */
/* eslint-disable comma-dangle */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
/* eslint-disable object-shorthand */
/* eslint-disable prefer-template */
/* eslint-disable arrow-parens */
/* eslint-disable no-unused-vars */

$(document).ready(() => {
  let todoId = 1;
  const todos = $(".todos");
  let todoTotal = 0; // 總共有幾個 todo
  let todoUnfinished = 0; // 有幾個「未完成的 todo」
  let isDone = null;
  const dataArr = []; // 從 UI 拿出資料
  updateCounter();

  const todoTemplate = `
      <div class="todo card mb-2">
        <div class="card-body d-flex align-items-center justify-content-between">
          <div class="form-check">
            <input class="todo-checkbox form-check-input" type="checkbox" id="todo-{id}">
            <label class="todo-content form-check-label" for="todo-{id}">{todo-content}</label>
          </div>
          <div class="todo-buttons">
            <button class="btn btn-info btn-edit">編輯</button>
            <button class="btn btn-danger btn-delete">刪除</button>
          </div>
        </div>
      </div>
  `;

  const editTodoTemplate = `
    <div class="form-group edit-todo">
      <input type="text" class="input-edit-todo form-control" value="{content}">
    </div>
  `;

  // 點擊「Add」按鈕來新增 todo
  $(".btn-add-todo").click(() => {
    addTodo();
  });

  // 按下 Enter 來新增 todo
  $(".input-todo").keydown((e) => {
    if (e.key === "Enter") {
      addTodo();
    }
  });

  // 刪除 todo
  todos.on("click", ".btn-delete", (e) => {
    if ($(e.target).parents(".todo").hasClass("finished")) {
      todoTotal -= 1;
    } else {
      todoTotal -= 1;
      todoUnfinished -= 1;
    }
    $(e.target).parents(".todo").remove();
    updateCounter();
  });

  // 編輯 todo
  todos.on("click", ".btn-edit", (e) => {
    const content = $(e.target)
      .parents(".card-body")
      .find(".todo-content")
      .text();
    isDone = $(e.target).parents(".todo").hasClass("finished");
    $(e.target)
      .parents(".todo")
      .prop(
        "outerHTML",
        editTodoTemplate.replace("{content}", escape(content))
      );
  });

  todos.on("keydown", ".input-edit-todo", (e) => {
    if (e.key === "Enter") {
      const newValue = $(e.target).val();
      todoId += 1;

      if (isDone) {
        // 如果是「已完成的 todo」，就要多加上 .finished 的 class
        $(e.target)
          .parent(".edit-todo")
          .prop(
            "outerHTML",
            todoTemplate
              .replace('">', ' finished">')
              .replace(/{id}/g, todoId)
              .replace("{todo-content}", newValue)
          );
      } else {
        $(e.target)
          .parent(".edit-todo")
          .prop(
            "outerHTML",
            todoTemplate
              .replace(/{id}/g, todoId)
              .replace("{todo-content}", escape(newValue))
          );
      }
    }

    // 手動幫「已完成的 todo」打勾
    checkCheckbox();
  });

  // 標記完成/未完成
  todos.on("change", ".todo-checkbox", (e) => {
    const isFinished = $(e.target).is(":checked");
    if (isFinished) {
      // 打勾
      $(e.target).parents(".todo").addClass("finished");
      todoUnfinished -= 1;
    } else {
      // 取消打勾
      $(e.target).parents(".todo").removeClass("finished");
      todoUnfinished += 1;
    }
    updateCounter();
  });

  // 移除已完成的 todo
  $(".btn-clear-all").click(() => {
    $(".finished").each((index, element) => {
      element.remove();
      todoTotal -= 1;
    });
    updateCounter();
  });

  // 篩選 todo（全部、未完成、已完成）
  $(".filters").on("click", ".filter", (e) => {
    // 全部
    if ($(e.target).hasClass("filter-all")) {
      $(".filter").each((index, element) => {
        $(element).removeClass("selected");
      });
      $(e.target).addClass("selected");

      $(".todo").removeClass("hide");
      return;
    }
    // 未完成
    if ($(e.target).hasClass("filter-unfinished")) {
      $(".filter").each((index, element) => {
        $(element).removeClass("selected");
      });
      $(e.target).addClass("selected");

      $(".todo-checkbox").each((index, element) => {
        if ($(element).is(":checked")) {
          $(element).parents(".todo").addClass("hide");
        } else {
          $(element).parents(".todo").removeClass("hide");
        }
      });
      return;
    }

    // 已完成
    if ($(e.target).hasClass("filter-finished")) {
      $(".filter").each((index, element) => {
        $(element).removeClass("selected");
      });
      $(e.target).addClass("selected");

      $(".todo-checkbox").each((index, element) => {
        if ($(element).is(":checked")) {
          $(element).parents(".todo").removeClass("hide");
        } else {
          $(element).parents(".todo").addClass("hide");
        }
      });
    }
  });

  // 按下「Save」按鈕
  $(".btn-save").click(() => {
    $(".todo").each((index, element) => {
      const id = $(element)
        .find(".todo-checkbox")
        .attr("id")
        .replace("todo-", "");
      const content = $(element).find(".todo-content").text();
      const isFinished = $(element).hasClass("finished");
      dataArr.push({
        id: id,
        content: content,
        isFinished: isFinished,
      });
    });

    $.ajax({
      type: "POST",
      // url: 'http://localhost:8080/saffran/week12-todoList/api_save_todos.php',
      url:
        "http://mentor-program.co/mtr04group4/saffran/week12-todo-list/api_save_todos.php",
      data: {
        todos: JSON.stringify(dataArr), // 把陣列先變成 JSON 字串
      },
    })
      .done(function (res) {
        const resId = res.id; // 拿到 response 裡面的 id
        window.location = `index.html?id=` + resId; // 把網頁導到專屬的 id
      })
      .fail(function () {
        alert("儲存發生錯誤！");
      });
  });

  // 拿到 url 上面的 id
  const searchParams = new URLSearchParams(window.location.search);
  const todosId = searchParams.get("id");

  // 如果 url 有這個專屬 id，才會去後端拿資料
  if (todosId) {
    // 發送一個 GET request 去後端拿 todos 的資料，並且用 url (query string) 的方式帶上專屬的 id 送到 api 去
    $.ajax({
      // url: `http://localhost:8080/saffran/week12-todoList/api_get_todos.php?id=` + todosId
      url:
        `http://mentor-program.co/mtr04group4/saffran/week12-todo-list/api_get_todos.php?id=` +
        todosId,
    })
      .done(function (res) {
        const data = JSON.parse(res.todos.todo_data); // 把 JSON 字串變回陣列
        restoreTodos(data);
      })
      .fail(function (err) {
        console.log(err);
      });
  }

  // 把拿到的 todos 資料，放到畫面上
  function restoreTodos(data) {
    if (data.length === 0) {
      return;
    }
    for (const todo of data) {
      const id = todo.id;
      const content = todo.content;

      if (todo.isFinished) {
        // 如果是「已完成的 todo」，就加上 .finished 的 class
        todos.append(
          todoTemplate
            .replace('">', ' finished">')
            .replace(/{id}/g, id)
            .replace("{todo-content}", escape(content))
        );
      } else {
        // 如果是「未完成的 todo」，就不用加上 .finished 的 class
        todos.append(
          todoTemplate
            .replace(/{id}/g, id)
            .replace("{todo-content}", escape(content))
        );
        todoUnfinished += 1;
      }
    }

    // 手動幫「已完成的 todo」打勾
    checkCheckbox();

    todoTotal = data.length;
    updateCounter();
    todoId = data[data.length - 1].id + 1; // 把 todo 的 id 設為「最後一個 todo id 再 + 1」
  }

  // 新增 todo
  function addTodo() {
    const value = $(".input-todo").val();
    if (!value) return; // 如果欄位是空的，就不會新增 todo
    todos.append(
      todoTemplate
        .replace(/{id}/g, todoId)
        .replace("{todo-content}", escape(value))
    );
    todoId += 1;
    todoUnfinished += 1;
    todoTotal += 1;
    $(".input-todo").val(""); // 清空欄位
    updateCounter();
  }

  // 更新 counter
  function updateCounter() {
    $(".number-unfinished").text(todoUnfinished);
  }

  // 手動幫「已完成的 todo」打勾
  function checkCheckbox() {
    $(".finished .todo-checkbox").prop("checked", true);
  }

  // 跳脫
  function escape(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
