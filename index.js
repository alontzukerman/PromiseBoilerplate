class Declare {

  constructor(executor) {
      this.successfulQueue = [];
      this.state = 'pending';
      this.value;

      executor(this.resolve.bind(this));
  }
  runSuccessfulHandlers() {
      if(this.successfulQueue.length > 0) {
          const resolution = this.successfulQueue.shift();
          let returnValue;

          if (typeof resolution.handler === 'function') {
              returnValue = resolution.handler(this.value);
          }

          if (returnValue instanceof Declare) {
              returnValue.then(value => {
                  resolution.promise.resolve(value);
              })
          } else {
              resolution.promise.resolve(returnValue);
          }
      }
  }
  resolve(value) {
      if (this.state === 'pending') {
          this.value = value;
          this.state = 'resolved';

          this.runSuccessfulHandlers();
      }
  }

  then(successfulHandler) {
      const newPromise = new Declare(() => {});

      this.successfulQueue.push({
          handler: successfulHandler,
          promise: newPromise
      });
      if (this.state === 'resolved') {
          this.runSuccessfulHandlers();
      }
      return newPromise;
  }
}

module.exports = Declare;