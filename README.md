### GPIOWSSERVER

This is a simple project to provide a WebSocket-based interface to the GPIO on a Raspberry Pi. It was developed to provide a backend for a React frontend to enable setting and reading GPIO pins in a web browser (thereby acting as a means for me to learn React).

The code is written in TypeScript using the `ws` WebSockets and `onoff` GPIO access libraries. It runs on a Raspberry Pi Model B+ with 8GB of RAM, using 64-bit Raspberry Pi OS 12 (Bookworm) and the 6.6 kernel. I have not tested it on other hardware although I see absolutely no reason why it should not work on a Pi 3 or 5. 

Requests to and responses from the server are JSON objects, suitably serialized. The syntax is simple and should be readily ascertainable from reading the code until this README is expanded.

This README is a stub; more details will follow.
