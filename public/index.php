<html>
<head>
    <style>
        ul {
            list-style: none;
            padding: 0;
            display: flex;
            flex-wrap: wrap;
            background-color: lightcoral;
            width: 400px;
            margin: auto;
        }

        li {
            background-color: lightyellow;
            flex: 1;
            padding: 20px;
            margin: 15px;
        }

        li.active {
            background-color: aqua;
        }

        .container {
            text-align: center;
        }
    </style>
</head>
<body>
<div class="container">
<h1>mselect javascript plugin</h1>
<ul>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
</ul>

    <button onclick="select.enable()">Enable Selection</button>
    <button onclick="select.disable()">Disable Selection</button>
</div>
<script src='mselect.js'></script>

</body>
</html>