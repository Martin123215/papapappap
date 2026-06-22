*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:'Inter',sans-serif;
}

body{
    background:#080b12;
    color:#fff;
    min-height:100vh;
}

header{
    background:#111827;
    border-bottom:2px solid #c1121f;
    padding:20px;
}

header h1{
    color:#c1121f;
    font-size:32px;
    font-weight:700;
}

main{
    max-width:1200px;
    margin:auto;
    padding:20px;
}

.card{
    background:#111827;
    border:1px solid #1f2937;
    border-radius:15px;
    padding:20px;
    margin-bottom:20px;
    box-shadow:0 0 20px rgba(0,0,0,.4);
}

.card h2{
    color:#fff;
    margin-bottom:20px;
}

form{
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(250px,1fr));
    gap:15px;
}

.input-group{
    display:flex;
    flex-direction:column;
}

.input-group label{
    margin-bottom:8px;
    color:#ccc;
}

input{
    background:#0f172a;
    border:1px solid #374151;
    color:white;
    padding:12px;
    border-radius:10px;
    outline:none;
}

input:focus{
    border-color:#c1121f;
}

.btn-save{
    background:#c1121f;
    color:white;
    border:none;
    border-radius:10px;
    padding:14px;
    cursor:pointer;
    font-weight:700;
    transition:.3s;
}

.btn-save:hover{
    background:#dc2626;
}

.search-box{
    margin-bottom:20px;
}

.search-box input{
    width:100%;
}

#depositTabs{
    display:flex;
    gap:10px;
    flex-wrap:wrap;
    margin-bottom:20px;
}

.tab{
    background:#1f2937;
    border:1px solid #374151;
    color:white;
    padding:10px 20px;
    border-radius:10px;
    cursor:pointer;
    transition:.3s;
}

.tab:hover{
    border-color:#c1121f;
}

.tab.active{
    background:#c1121f;
    border-color:#c1121f;
}

table{
    width:100%;
    border-collapse:collapse;
    overflow:hidden;
    border-radius:10px;
}

th{
    background:#1f2937;
    padding:15px;
    text-align:left;
}

td{
    padding:15px;
    border-bottom:1px solid #1f2937;
}

tr:hover{
    background:#0f172a;
}

.btn-plus{
    background:#16a34a;
    color:white;
    border:none;
    padding:8px 12px;
    border-radius:8px;
    cursor:pointer;
    margin-right:5px;
}

.btn-minus{
    background:#dc2626;
    color:white;
    border:none;
    padding:8px 12px;
    border-radius:8px;
    cursor:pointer;
    margin-right:5px;
}

.btn-delete{
    background:#7f1d1d;
    color:white;
    border:none;
    padding:8px 12px;
    border-radius:8px;
    cursor:pointer;
}

footer{
    text-align:center;
    padding:20px;
    color:#888;
}

@media(max-width:768px){

    form{
        grid-template-columns:1fr;
    }

    table{
        font-size:14px;
    }

    th,
    td{
        padding:10px;
    }

    header h1{
        font-size:24px;
    }
}
