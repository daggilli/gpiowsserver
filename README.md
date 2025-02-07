## GPIOWSSERVER

**Gpiowsserver** provides a WebSocket-based interface to the GPIO on a Raspberry Pi. It was developed to provide a backend for a React frontend to enable setting and reading GPIO pins in a web browser but should prove useful in its own right.

The code is written in TypeScript using the `ws` WebSockets and `onoff` GPIO access libraries. It runs (at least) on a Raspberry Pi Model B+ with 8GB of RAM, using 64-bit Raspberry Pi OS 12 (Bookworm) and the 6.6 kernel, this being the machine on which it was written. It has not been tested on other hardware although I see absolutely no reason why it should not work on a Pi 3 or 5.

### Request and response syntax

Requests ('commands') to and responses from the server are JSON objects, suitably serialized.

Commands have the following common format:

```json
{
  "command": "string"
}
```

Almost all commands, with the exception of the `getRegisteredPins` command, require a suitable `params` field.

```json
{
  "command": "string"
  "params": {
    ...
  },
}
```

An example (to read the state of a GPIO pin) is as follows:

```json
{
  "command": "readState",
  "params": {
    "pinName": "GPIO17"
  }
}
```

To _set_ the state of a pin high (3.3V) the following command could be used:

```json
{
  "command": "setState",
  "params": {
    "pinName": "GPIO21 ",
    "state": true
  }
}
```

Responses have a common format:

```json
{
  "messageType": "string",
  "data": {
    ...
  }
}
```

The response to query-type commands will have an appropriate `messageType` field with the body of the response in the `data` object. Responses to action-type commands will have a `messageType` of `ack`, with informational fields in the `data` object. For example, the response to the `readState` command above might be:

```json
{
  "messageType": "state",
  "data": {
    "pinName": "GPIO17",
    "state": false
  }
}
```

indicating that the pin is seeing a low logic level. The response to the `setState` command would be:

```json
{
  "messageType": "ack",
  "data": {
    "command": "setState",
    "pinName": "GPIO21"
  }
}
```

A full list of all commands and possible responses can be found in [commands](docs/commands.md).

### Configuration

The server reads a configuration file at startup.
