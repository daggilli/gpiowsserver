'use strict';
import { GpioServerConfig } from '../src/interfaces.js';

export const INPUT_PIN = 'GPIO17';
export const OUTPUT_PIN = 'GPIO21';
export const NEW_PIN = 'GPIO22';
const BAD_PIN = 'BAD_PIN';
const MESSAGE_ID = 'messageid_1234';
export const UUIDV4 = '6ee8a8d6-1fb0-44e0-abd0-0f826a70211c';
export const JEST_TEST_SUITE_NAME = 'GpioSocketServer';
export const JEST_CREATE_SERVER_TEST_NAME = 'should create a GpioSocketServer';

export const SERVER_CONFIG: GpioServerConfig = {
  port: 12313,
  pins: [
    {
      pinName: INPUT_PIN,
      direction: 'in',
      edge: 'both',
    },
    {
      pinName: OUTPUT_PIN,
      direction: 'out',
    },
  ],
};

export const MALFORMED_COMMAND = {
  noCmmmandField: true,
};

export const MALFORMED_COMMAND_UNKNOWN = {
  command: '__NOT_A_VALID_COMMAND__',
};

export const MALFORMED_COMMAND_EXPECTED_SEND =
  '{"messageType":"error","data":{"errorString":"request message was malformed"}}';

export const MALFORMED_COMMAND_NO_PINNAME = {
  command: 'setState',
  params: {},
};

export const MALFORMED_COMMAND_NO_STATE = {
  command: 'setState',
  params: {
    pinName: OUTPUT_PIN,
  },
};
export const MALFORMED_COMMAND_NO_DIRECTION = {
  command: 'registerPin',
  params: {
    pinName: OUTPUT_PIN,
  },
};

export const MALFORMED_COMMAND_UNREGISTERED_PIN = {
  command: 'setState',
  params: {
    pinName: BAD_PIN,
    state: false,
  },
};
export const MALFORMED_COMMAND_UNREGISTERED_PIN_EXPECTED_SEND =
  '{"messageType":"error","data":{"errorString":"pin BAD_PIN is not registered"}}';

export const CREATE_SERVER_EXEPECTED_ARGS = [
  [17, 'in', 'both'],
  [21, 'out', undefined],
];

export const SET_PIN_STATE_COMMAND = {
  command: 'setState',
  params: {
    pinName: OUTPUT_PIN,
    state: true,
  },
};
export const SET_PIN_STATE_EXPECTED_SEND =
  '{"messageType":"ack","data":{"command":"setState","pinName":"GPIO21"}}';

export const SET_PIN_STATE_COMMAND_WITH_ID = {
  command: 'setState',
  messageId: MESSAGE_ID,
  params: {
    pinName: OUTPUT_PIN,
    state: true,
  },
};
export const SET_PIN_STATE_WITH_ID_EXPECTED_SEND = `{"messageType":"ack","messageId":"${MESSAGE_ID}","data":{"command":"setState","pinName":"GPIO21"}}`;

export const TOGGLE_PIN_STATE_COMMAND = {
  command: 'toggleState',
  params: {
    pinName: OUTPUT_PIN,
  },
};
export const TOGGLE_PIN_STATE_EXPECTED_SEND =
  '{"messageType":"ack","data":{"command":"toggleState","pinName":"GPIO21","state":false}}';

export const GET_PIN_STATE_COMMAND = {
  command: 'readState',
  params: {
    pinName: OUTPUT_PIN,
  },
};
export const GET_PIN_STATE_EXPECTED_SEND =
  '{"messageType":"state","data":{"pinName":"GPIO21","state":true}}';

export const GET_PIN_DIRECTION_COMMAND = {
  command: 'readDirection',
  params: {
    pinName: OUTPUT_PIN,
  },
};
export const GET_PIN_DIRECTION_EXPECTED_SEND =
  '{"messageType":"direction","data":{"pinName":"GPIO21","direction":"out"}}';

export const REGISTER_PIN_COMMAND = {
  command: 'registerPin',
  params: {
    pinName: NEW_PIN,
    direction: 'in',
    edge: 'rising',
  },
};
export const REGISTER_PIN_EXPECTED_ARGS = [22, 'in', 'rising'];
export const REGISTER_PIN_EXPECTED_SEND =
  '{"messageType":"ack","data":{"command":"registerPin","pinName":"GPIO22"}}';

export const REGISTER_PIN_WITH_DEBOUNCE_COMMAND = {
  command: 'registerPin',
  params: {
    pinName: NEW_PIN,
    direction: 'in',
    edge: 'rising',
    debounceTimeout: 10,
  },
};
export const REGISTER_PIN_WITH_DEBOUNCE_EXPECTED_ARGS = [
  22,
  'in',
  'rising',
  { debounceTimeout: 10 },
];

export const GET_REG_PINS_COMMAND = { command: 'getRegisteredPins' };
export const GET_REG_PINS_EXPECTED_SEND =
  '{"messageType":"registeredPins","data":[{"pinName":"GPIO17","direction":"in","edge":"both","state":true},{"pinName":"GPIO21","direction":"out","state":true},{"pinName":"GPIO22","direction":"in","edge":"rising","state":true}]}';

export const STATE_CHANGE_EXPECTED_SEND =
  '{"messageType":"stateChange","data":{"pinName":"GPIO17","edge":"rising"}}';
export const STATE_CHAHNGE_WITH_ID_EXPECTED_SEND = `{"messageType":"stateChange","messageId":"${UUIDV4}","data":{"pinName":"GPIO17","edge":"rising"}}`;
