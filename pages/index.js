import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import logo from "./hydro-chat.svg"

function ConnectedUI({ name, url, onError, onClose }) {
  const nextID = useRef(0);
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState("");

  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => {
    try {
      const ws = new WebSocket(url);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessages(old => [...old, data]);
      };

      ws.onopen = () => {
        ws.send(JSON.stringify({
          "Name": name
        }));
        setIsConnected(true);
      };

      ws.onclose = onClose;

      wsRef.current = ws;

      return () => {
        ws.onmessage = () => {};
        ws.onopen = () => {};
        ws.onclose = () => {};
        ws.close();

        if (wsRef.current === ws) {
          wsRef.current = null;
        }
      };
    } catch (e) {
      onError(e.toString());
    }
  }, [url]);

  const scrollRef = useRef(null);

  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    !isConnected ? <div>
      <h1>Connecting...</h1>
    </div> : <>
      <div style={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        overflowY: "scroll",
        paddingLeft: "10px",
        paddingRight: "10px"
      }} ref={scrollRef}>
        {messages.map((message, i) => (
          <div key={i} style={{
            border: "1px solid #aaa",
            borderRadius: "10px",
            fontSize: "24px",
            padding: "10px",
            marginTop: "10px"
          }}>
            <div style={{
              fontWeight: "bold"
            }}>{message.name}</div>
            <div>{message.text}</div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: "10px",
        marginBottom: "10px",
        paddingLeft: "10px",
        paddingRight: "10px",
      }}>
        <form style={{
          display: "flex",
          width: "100%"
        }} onSubmit={(e) => {
          e.preventDefault();
          setTypedMessage("");
          if (wsRef.current) {
            wsRef.current.send(JSON.stringify({
              "Message": {
                "id": nextID.current++,
                "text": typedMessage
              }
            }));
          }
        }}>
          <input type="text" style={{
            fontSize: "24px",
            flexGrow: 1,
            borderRadius: "10px",
            border: "1px solid #aaa",
            padding: "10px",
            minWidth: "0px"
          }} value={typedMessage} onInput={(e) => {
            setTypedMessage(e.target.value)
          }}></input>
          <button style={{
            background: "#0096FF",
            color: "white",
            fontSize: "24px",
            padding: "10px",
            marginLeft: "10px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }} type="submit">Send</button>
        </form>
      </div>
    </>
  )
}

const wsMapping = {
  '1000': 'Normal Closure',
  '1001': 'Going Away',
  '1002': 'Protocol Error',
  '1003': 'Unsupported Data',
  '1004': '(For future)',
  '1005': 'No Status Received',
  '1006': 'Abnormal Closure',
  '1007': 'Invalid frame payload data',
  '1008': 'Policy Violation',
  '1009': 'Message too big',
  '1010': 'Missing Extension',
  '1011': 'Internal Error',
  '1012': 'Service Restart',
  '1013': 'Try Again Later',
  '1014': 'Bad Gateway',
  '1015': 'TLS Handshake'
};

export default function Home() {
  const [typedServer, setTypedServer] = useState("");
  const [typedName, setTypedName] = useState("");
  const [server, setServer] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [isHTTPS, setIsHTTPS] = useState(false);
  useLayoutEffect(() => {
    setIsHTTPS(location.protocol === "https:");
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>HydroChat</title>
        <meta name="description" content="A demo application for Hydroflow" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.title}>
          <a style={{
            cursor: "pointer"
          }} onClick={() => {
            setServer(null)
          }}>
            <Image
              alt={"The Hydro Chat logo"}
              priority
              src={logo}
              style={{
                display: "block",
                maxHeight: "70px",
                width: "auto",
                padding: "5px",
                marginLeft: "auto",
                marginRight: "auto"
              }}
            />
          </a>
        </div>

        {!server ? (isHTTPS ?
          <h1>You appear to be using https, please use the <a style={{ color: "blue" }}href="http://chat.hydro.run">HTTP version</a></h1> : (
          <form style={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            paddingLeft: "10px",
            paddingRight: "10px"
          }} onSubmit={(e) => {
            e.preventDefault();
            setServer(`ws://${typedServer}`);
          }}>
            <input type="text" style={{
              fontSize: "40px",
              width: "100%",
              maxWidth: "500px",
              alignSelf: "center",
              borderRadius: "10px",
              border: "1px solid #aaa",
              padding: "10px",
            }} placeholder="IP:Port" value={typedServer} onInput={(e) => {
              setTypedServer(e.target.value)
            }}></input>
            <input type="text" style={{
              fontSize: "40px",
              width: "100%",
              maxWidth: "500px",
              alignSelf: "center",
              marginTop: "15px",
              borderRadius: "10px",
              border: "1px solid #aaa",
              padding: "10px",
            }} placeholder="Name" value={typedName} onInput={(e) => {
              setTypedName(e.target.value)
            }}></input>
            <button style={{
              background: "#0096FF",
              color: "white",
              fontSize: "40px",
              padding: "10px",
              marginTop: "10px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              alignSelf: "center"
            }} type="submit">Connect</button>

            {errorMessage && (
              <div style={{
                marginTop: "10px",
                color: "red",
                fontSize: "24px",
                textAlign: "center"
              }}>{errorMessage}</div>
            )}
          </form>
        )) : (
          <ConnectedUI name={typedName} url={server} onError={(msg) => {
            setServer(null);
            setErrorMessage(msg);
          }} onClose={(event) => {
            setServer(null);
            setErrorMessage(`Connection closed: ${wsMapping[event.code.toString()]}`);
          }} />
        )}
      </main>
    </div>
  )
}
