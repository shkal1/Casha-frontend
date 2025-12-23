// C:\Casha\CashaWallet\src\services\ppi-language.js
// FIXED VERSION - Proper method chaining

export function PPI_SEND(amount) {
  console.log('🔄 PPI_SEND called with amount:', amount);
  
  const builder = {
    TO: (recipient) => {
      console.log('📧 Recipient:', recipient);
      return builder; // ✅ FIXED: Return builder for chaining
    },
    WITH_MESSAGE: (message) => {
      console.log('💬 Message:', message);
      return builder; // ✅ FIXED: Return builder for chaining
    },
    WITH_FEE: (fee) => {
      console.log('💰 Fee:', fee);
      return builder; // ✅ FIXED: Return builder for chaining
    },
    compile: () => ({ 
      type: 'PPI_SEND_STUB', 
      parameters: { amount },
      operation: 'SEND'
    }),
    getState: () => ({ amount, operation: 'PPI_SEND' }),
    toString: () => `PPI_SEND(${amount})`,
    toJSON: () => ({ amount, operation: 'PPI_SEND' })
  };
  
  return builder; // ✅ FIXED: Return the builder object
}

export function PPI_RECEIVE(amount) {
  console.log('🔄 PPI_RECEIVE called with amount:', amount);
  
  const builder = {
    FROM: (sender) => {
      console.log('📧 Sender:', sender);
      return builder; // ✅ FIXED: Return builder for chaining
    },
    TO: (recipient) => {
      console.log('📧 Recipient:', recipient);
      return builder; // ✅ FIXED: Return builder for chaining
    },
    WITH_MESSAGE: (message) => {
      console.log('💬 Message:', message);
      return builder; // ✅ FIXED: Return builder for chaining
    },
    EXPIRES_IN: (duration) => {
      console.log('⏰ Expires in:', duration);
      return builder; // ✅ FIXED: Return builder for chaining
    },
    compile: () => ({ 
      type: 'PPI_RECEIVE_STUB', 
      parameters: { amount },
      operation: 'RECEIVE'
    }),
    getState: () => ({ amount, operation: 'PPI_RECEIVE' }),
    toString: () => `PPI_RECEIVE(${amount})`,
    toJSON: () => ({ amount, operation: 'PPI_RECEIVE' })
  };
  
  return builder; // ✅ FIXED: Return the builder object
}

// Fixed stub functions with proper chaining
export function PPI_ESCROW(amount) { 
  console.log('🔄 PPI_ESCROW called with amount:', amount);
  return createStub('PPI_ESCROW', amount); 
}

export function PPI_SPLIT(amount) { 
  console.log('🔄 PPI_SPLIT called with amount:', amount);
  return createStub('PPI_SPLIT', amount); 
}

export function PPI_IF(condition) { 
  console.log('🔄 PPI_IF called with condition:', condition);
  return createStub('PPI_IF', condition); 
}

export function PPI_SCHEDULE(amount) { 
  console.log('🔄 PPI_SCHEDULE called with amount:', amount);
  return createStub('PPI_SCHEDULE', amount); 
}

export function PPI_STREAM(amount) { 
  console.log('🔄 PPI_STREAM called with amount:', amount);
  return createStub('PPI_STREAM', amount); 
}

export function PPI_VOTE(proposal) { 
  console.log('🔄 PPI_VOTE called with proposal:', proposal);
  return createStub('PPI_VOTE', proposal); 
}

function createStub(operation, value) {
  const builder = {
    // Add common methods that might be called
    WITH_MESSAGE: (message) => {
      console.log('💬 Message:', message);
      return builder;
    },
    compile: () => ({ 
      type: `${operation}_STUB`, 
      parameters: { value },
      operation: operation 
    }),
    getState: () => ({ value, operation }),
    toString: () => `${operation}(${value})`,
    toJSON: () => ({ value, operation })
  };
  return builder;
}

export class PPIExecutionService {
  static async execute(operation) {
    console.log('🚀 Executing PPI operation:', operation.toString());
    return { 
      success: true, 
      message: 'PPI stub executed',
      transaction_id: 'stub_tx_' + Date.now()
    };
  }
  
  static async simulate(operation) {
    console.log('🧪 Simulating PPI operation:', operation.toString());
    return { 
      success: true, 
      simulated: true, 
      message: 'PPI stub simulated',
      operation: operation.getState()
    };
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