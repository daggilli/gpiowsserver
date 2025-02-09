## Commands
These are representative examples of all available commands with responses.

### `setState`
```json
{
  "command": "setState",
  "params": {
    "pinName": "GPIO21",
    "state": true
  }
}
```
```json
{
  "messageType": "ack",
  "data":{
    "command": "setState",
    "pinName": "GPIO21"
  }
}
```

### `toggleState`
```json
{
  "command": "toggleState",
  "params": {
    "pinName": "GPIO21"
  }
}
```
```json
{
  "messageType": "ack",
  "data": {
    "command": "toggleState",
    "pinName": "GPIO21",
    "state":false
  }
}
```

### `readState`
```json
{
  "command": "readState",
  "params": {
    "pinName": "GPIO21"
  }
}
```
```json
{
  "messageType": "state",
  "data": {
    "pinName": "GPIO21",
    "state": true
  }
}
```

### `readDirection`
```json
{
  "command": "readDirection",
  "params": {
    "pinName": "GPIO21"
  }
}
```
```json
{
  "messageType": "direction",
  "data": {
    "pinName": "GPIO21",
    "direction": "out"
  }
}
```

### `registerPin`
```json
{
  "command": "registerPin",
  "params": {
    "pinName": "GPIO22",
    "direction": "in",
    "edge": "falling"
  }
}
```
```json
{
  "messageType": "ack",
  "data": {
    "command": "registerPin",
    "pinName":"GPIO22"
  }
}
```

### `getRegisteredPins`
```json
{
  "command": "getRegisteredPins"
}
```
```json
{
  "messageType": "registeredPins",
  "data": [
    {
      "pinName": "GPIO17",
      "direction":"in",
      "edge":"both",
      "state":true
    },
    {
      "pinName": "GPIO21",
      "direction": "out",
      "state": true
    },
    {
      "pinName": "GPIO22",
      "direction": "in",
      "edge": "rising",
      "state": true
    }
  ]
}
```

### Errors
If a command is unrecognised or malformed the server will respond with:
```json
{
  "messageType": "error",
  "data": {
    "errorString": "request message was malformed"
  }
}
```

If a command attempts to access a pin that has not been registered the server will respond with:
```json
{
  "messageType": "error",
  "data": {
    "errorString": "pin XXX is not registered"
  }
}
```
where `XXX` is the name of the pin requested.
