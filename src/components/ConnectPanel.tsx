import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { invoke } from "@tauri-apps/api/core";

interface Props {
  onLog: (msg: string) => void;
  onConnectedChange: (v: boolean) => void;
}

interface Config {
  host?: string;
  user?: string;
  pass?: string;
  port?: number;
}

const ConnectPanel: React.FC<Props> = ({ onLog, onConnectedChange }) => {
  const FALLBACK: Required<Config> = {
    host: "",
    user: "",
    pass: "",
    port: 22,
  };

  const [host, setHost] = useState(FALLBACK.host);
  const [user, setUser] = useState(FALLBACK.user);
  const [pass, setPass] = useState(FALLBACK.pass);
  const [port, setPort] = useState(FALLBACK.port);
  const [busy, setBusy] = useState(false);
  const [connected, setConnected] = useState(false);

  // ランタイムで public/config.local.json があれば読み込む（Git未管理）
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/config.local.json", { cache: "no-store" });
        if (!res.ok) return; // 404等は無視してフォールバック
        const json = (await res.json()) as Config;
        if (cancelled) return;

        setHost(json.host ?? FALLBACK.host);
        setUser(json.user ?? FALLBACK.user);
        setPort(typeof json.port === "number" ? json.port : FALLBACK.port);
      } catch {
        // 読込失敗時はフォールバックのまま
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const connect = async () => {
    setBusy(true);
    invoke<string>("ssh_connect", {
      username: user,
      password: pass,
      host,
      port,
    })
      .then((res) => {
        onLog(res);
        onConnectedChange(true);
      })
      .catch((e: Error) => {
        onLog(e.message);
        onConnectedChange(false);
      })
      .finally(() => {
        setBusy(false);
        setConnected(true);
      });
  };

  const disconnect = async () => {
    setBusy(true);
    invoke<string>("ssh_disconnect")
      .then((res) => {
        onLog(res);
        onConnectedChange(false);
      })
      .catch((e: Error) => {
        onLog(e.message);
      })
      .finally(() => {
        setBusy(false);
        setConnected(false);
      });
  };

  return (
    <Card sx={{ width: 380 }}>
      <CardContent>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
          <TextField label="Host" value={host} onChange={(e) => setHost(e.target.value)} />
          <TextField
            label="Port"
            type="number"
            value={port}
            onChange={(e) => setPort(Number(e.target.value))}
          />
          <TextField label="User" value={user} onChange={(e) => setUser(e.target.value)} />
          <TextField
            label="Password"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
        </Box>
        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
          <Button
            variant={connected ? "outlined" : "contained"}
            onClick={connect}
            disabled={busy}
            loading={busy}
          >
            {connected ? "Connected" : "Connect"}
          </Button>
          <Button
            variant={connected ? "contained" : "outlined"}
            onClick={disconnect}
            disabled={busy}
          >
            Disconnect
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ConnectPanel;
