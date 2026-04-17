* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #0f172a, #1e2937);
    color: #e2e8f0;
    height: 100vh;
    overflow: hidden;
}

header {
    background: linear-gradient(90deg, #1e40af, #3b82f6);
    padding: 15px 20px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 100;
}

header h1 {
    font-size: 24px;
    margin-bottom: 4px;
}

header p {
    font-size: 15px;
    opacity: 0.9;
}

.container {
    display: grid;
    grid-template-columns: 340px 1fr;
    height: calc(100vh - 68px);
}

.painel {
    background: rgba(15, 23, 42, 0.95);
    padding: 25px;
    border-right: 1px solid #334155;
    overflow-y: auto;
    backdrop-filter: blur(8px);
}

.btn-falar {
    width: 100%;
    padding: 18px;
    font-size: 18px;
    font-weight: bold;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    margin: 20px 0;
    transition: all 0.3s;
    box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
}

.btn-falar:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(34, 197, 94, 0.5);
}

.saida {
    background: #1e2937;
    padding: 18px;
    border-radius: 10px;
    min-height: 80px;
    border: 2px solid #334155;
    margin-bottom: 20px;
    line-height: 1.5;
}

.info h3 {
    margin: 20px 0 10px;
    color: #60a5fa;
    font-size: 16px;
}

.info ul {
    list-style: none;
}

.info li {
    padding: 6px 0;
    color: #cbd5e1;
}

#map {
    height: 100%;
    width: 100%;
}

/* Responsivo */
@media (max-width: 900px) {
    .container {
        grid-template-columns: 1fr;
        height: auto;
    }
    .painel {
        height: auto;
        max-height: 45vh;
    }
    #map {
        height: 55vh;
    }
}
