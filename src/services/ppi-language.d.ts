// TEMPORARY STUB - We'll implement the real PPI integration later
// This fixes the TypeScript module error immediately

export function PPI_SEND(amount) {
  console.log('🔄 PPI_SEND called with amount:', amount);
  return {
    TO: (recipient) => {
      console.log('📧 Recipient:', recipient);
      return this;
    },
    WITH_MESSAGE: (message) => {
      console.log('💬 Message:', message);
      return this;
    },
    compile: () => ({ type: 'PPI_SEND_STUB' }),
    getState: () => ({ amount, operation: 'PPI_SEND' }),
    toString: () => `PPI_SEND(${amount})`
  };
}

export function PPI_RECEIVE(amount) {
  console.log('🔄 PPI_RECEIVE called with amount:', amount);
  return {
    FROM: (sender) => {
      console.log('📧 Sender:', sender);
      return this;
    },
    TO: (recipient) => {
      console.log('📧 Recipient:', recipient);
      return this;
    },
    WITH_MESSAGE: (message) => {
      console.log('💬 Message:', message);
      return this;
    },
    EXPIRES_IN: (duration) => {
      console.log('⏰ Expires in:', duration);
      return this;
    },
    compile: () => ({ type: 'PPI_RECEIVE_STUB' }),
    getState: () => ({ amount, operation: 'PPI_RECEIVE' }),
    toString: () => `PPI_RECEIVE(${amount})`
  };
}

// Stub other PPI functions
export function PPI_ESCROW(amount) { return createStub('PPI_ESCROW', amount); }
export function PPI_SPLIT(amount) { return createStub('PPI_SPLIT', amount); }
export function PPI_IF(condition) { return createStub('PPI_IF', condition); }
export function PPI_SCHEDULE(amount) { return createStub('PPI_SCHEDULE', amount); }
export function PPI_STREAM(amount) { return createStub('PPI_STREAM', amount); }
export function PPI_VOTE(proposal) { return createStub('PPI_VOTE', proposal); }

function createStub(operation, value) {
  return {
    compile: () => ({ type: `${operation}_STUB` }),
    getState: () => ({ value, operation }),
    toString: () => `${operation}(${value})`
  };
}

export class PPIExecutionService {
  static async execute(operation) {
    console.log('🚀 Executing PPI operation:', operation.toString());
    return { success: true, message: 'PPI stub executed' };
  }
  
  static async simulate(operation) {
    console.log('🧪 Simulating PPI operation:', operation.toString());
    return { success: true, simulated: true, message: 'PPI stub simulated' };
  }
}

export default {
  PPI_SEND,
  PPI_RECEIVE,
  PPI_ESCROW,
  PPI_SPLIT,
  PPI_IF,
  PPI_SCHEDULE,
  PPI_STREAM,
  PPI_VOTE,
  PPIExecutionService
};