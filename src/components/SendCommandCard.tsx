import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { invoke } from "@tauri-apps/api/core";

const commands = ["ls", "pwd", "whoami"];
const defaultCommand = commands[0];

interface Props {
  setOutput: (output: string) => void;
  isConnected?: boolean;
}

const SendCommandCard: React.FC<Props> = ({ setOutput, isConnected = false }) => {
  const [selectedCommand, setSelectedCommand] = useState(defaultCommand);

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCommand((event.target as HTMLInputElement).value);
  };

  async function sendCommand() {
    console.log("selectedCommand", selectedCommand);
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setOutput(await invoke("ssh_exec", { command: selectedCommand }));
  }

  return (
    <Card>
      <CardContent>
        <FormControl sx={{ width: "100%" }}>
          <FormLabel>Select Command</FormLabel>
          <RadioGroup
            aria-labelledby="command-group-label"
            defaultValue={defaultCommand}
            name="radio-buttons-group"
            onChange={handleRadioChange}
          >
            {commands.map((command) => (
              <FormControlLabel key={command} value={command} control={<Radio />} label={command} />
            ))}
          </RadioGroup>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              mt: 2,
            }}
          >
            <Button variant="contained" onClick={sendCommand} disabled={!isConnected}>
              Send
            </Button>
          </Box>
        </FormControl>
      </CardContent>
    </Card>
  );
};

export default SendCommandCard;
