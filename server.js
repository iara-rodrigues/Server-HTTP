const http = require('http')
const express = require("express")
const app = express()
const fs = require('fs');
const path = require('path');

const { Server } = require('socket.io')
const serverHTTP = http.createServer(app);
serverHTTP.maxConnections = 40;
const io = new Server(serverHTTP)

const dotenv = require('dotenv');
dotenv.config();

PATH_DIR = process.env.PATH_DIR  //ALTERAR
PORT = process.env.PORT
//HOST = process.env.HOST

var linksList = function(dir, files) {
    var links = []
    var link
     const fs = require ('fs') 
      
        files.forEach((file) => {
            const pathC = `${dir}/${file}`;
            const stat = fs.statSync(pathC);

            if(stat.isDirectory()){
                link = `<a href="${pathC}/">${file}/</a>`
                links.push(link, "<br>")   
            } else {
                if(stat.isFile()){
                    link = `<a href="${pathC}">${file}</a>`
                    links.push(link, "<br>")
                }
            }
        });
        links = links.join(' ') //sem virgula entre cada link
        return links
}


app.get("/", (req, res) => {
    var links = []

    fs.readdir(PATH_DIR, (erro, files) => {
        if (erro) {
          console.error('Erro ao ler o diretório:', erro);
          return;
        } 
 
        links = linksList(PATH_DIR, files)
   
        const htmlResponse = `
            <html>
            <head>
                <style>
                body {
                    background-color: #f2f2f2;
                    font-family: Arial, sans-serif;
                    text-align: left;
                    padding: 20px;
                }
                h1 {
                    color: #da6b6b;
                }
                a{
                    color: #6E0A78
                }
                </style>
            </head>
            <body>
                <h1> Arquivos em ${PATH_DIR}: </h1>
                <p>${links}</p>
            </body>
            </html>
        `;

        //res.send(`${links}`)
        res.send(htmlResponse)
    })
})


app.get(`${PATH_DIR}`+ '/*', (req, res) => {
    let diretorioParam = req.params[0];
    const diretorioCompleto = path.join(PATH_DIR, diretorioParam); 
            
    const stat = fs.statSync(diretorioCompleto);
    if(stat.isFile()){
        fs.readFile(diretorioCompleto, (erro, conteudoArquivo) => {
            if (erro) {
              console.error('Erro ao ler o arquivo:', erro);
              res.status(500).send('Essa rota não é válida.');
              return;
            }

            const partes = diretorioCompleto.split('/');
            const filename = partes[partes.length - 1]

            res.setHeader('Content-Disposition', 'attachment; filename=', filename);

            res.send(conteudoArquivo);

        });
    } else {
        if(stat.isDirectory()){
            fs.readdir(diretorioCompleto, (err, files) => {
                if (err) {
                    console.error('Erro ao ler o diretório:', err);
                    res.status(500).send('Erro ao ler o diretório');
                    return;
                }
        
                links = linksList(diretorioCompleto, files)

                const htmlResponse = `
                    <html>
                        <head>
                            <style>
                            body {
                                background-color: #f2f2f2;
                                font-family: Arial, sans-serif;
                                text-align: left;
                                padding: 20px;
                            }
                            h1 {
                                color: #da6b6b;
                            }
                            a{
                                color: #6E0A78
                            }
                            </style>
                        </head>
                        <body>
                            <h1> Arquivos em ${diretorioCompleto}: </h1>
                            <p>${links}</p>
                        </body>
                    </html>
                `;

                //res.send(`${links}`)
                res.send(htmlResponse)
            })
        }
    }
})


app.get("/header", (req, res) => { 
    const requestHeaders = req.headers;

    const jsonString = JSON.stringify(requestHeaders, null, 2);

    const htmlResponse = `
        <html>
            <head>
                <style>
                body {
                    background-color: #f2f2f2;
                    font-family: Arial, sans-serif;
                    text-align: left;
                    padding: 20px;
                }
                h1 {
                    color: #da6b6b;
                }
                pre{
                    color: #6E0A78
                }
                </style>
            </head>
            <body>
                <h1> Cabeçalho HTTP: </h1>
                <pre>${jsonString}</pre>
            </body>
        </html>
    `;

    res.send(htmlResponse); 
})

app.get("/hello", (req, res) => {
    const htmlResponse = `
        <html>
            <head>
                <style>
                body {
                    background-color: #f2f2f2;
                    font-family: Arial, sans-serif;
                    text-align: left;
                    padding: 20px;
                }
                h1 {
                    color: #da6b6b;
                }
                p{
                    color: #6E0A78
                }
                </style>
            </head>
            <body>
                <h1> Hello! </h1>
                <p>How are you?</p>
            </body>
        </html>
    `;
    res.send(htmlResponse)
})

app.get("/chat", (req, res) => {
    console.log(__dirname)
    res.sendFile(__dirname + '/chat.html')
})

app.get('*', (req, res) => {

});

// Conexão de socket
io.on('connection', (socket) => {
    console.log('Um cliente se conectou: ', socket.id);
  
    // Receber mensagem do cliente
    socket.on('mensagem', (msg) => {
      console.log('Mensagem recebida:', msg);
      
      // Enviar mensagem para todos os clientes conectados
      io.emit('mensagem', msg);
    });
  
    // Disconexão de socket
    socket.on('disconnect', () => {
      console.log('Um cliente se desconectou: ', socket.id);
    });
  });


serverHTTP.listen(PORT, '0.0.0.0', () =>
    console.log("Servidor funcionando na porta " + PORT)
);

