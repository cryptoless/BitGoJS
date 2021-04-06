import should from 'should';
import { StacksTestnet } from '@stacks/network';
import { register } from '../../../../../src/index';
import { TransactionBuilderFactory } from '../../../../../src/coin/stx';
import * as testData from '../../../../resources/stx/stx';
import { TransactionType } from '../../../../../src/coin/baseCoin';

describe('Stx Transfer Builder', () => {
  const factory = register('stx', TransactionBuilderFactory);

  const initTxBuilder = () => {
    const txBuilder = factory.getTransferBuilder();
    txBuilder.fee({ fee: '180' });
    txBuilder.nonce(0);
    txBuilder.to(testData.TX_RECIEVER.address);
    txBuilder.amount('1000');
    return txBuilder;
  };

  describe('should build ', () => {
    it('a signed transfer transaction', async () => {
      const builder = initTxBuilder();
      builder.sign({ key: testData.TX_SENDER.prv });
      const tx = await builder.build();

      const txJson = tx.toJson();
      // should.deepEqual(tx.signature.length, 1);
      should.deepEqual(txJson.payload.to, testData.TX_RECIEVER.address);
      should.deepEqual(txJson.payload.amount, '1000');
      should.deepEqual(txJson.from, testData.TX_SENDER.address);
      should.deepEqual(txJson.nonce, 0);
      should.deepEqual(txJson.fee.toString(), '180');
      should.deepEqual(tx.toBroadcastFormat(), testData.SIGNED_TRANSACTION);
      tx.type.should.equal(TransactionType.Send);

      tx.outputs.length.should.equal(1);
      tx.outputs[0].address.should.equal(testData.TX_RECIEVER.address);
      tx.outputs[0].value.should.equal('1000');
      tx.inputs.length.should.equal(1);
      tx.inputs[0].address.should.equal(testData.TX_SENDER.address);
      tx.inputs[0].value.should.equal('1000');
    });

    it('a transfer transaction with memo', async () => {
      const builder = initTxBuilder();
      builder.memo('This is an example');
      builder.sign({ key: testData.TX_SENDER.prv })
      const tx = await builder.build();
      const txJson = tx.toJson();
      should.deepEqual(txJson.payload.to, testData.TX_RECIEVER.address);
      should.deepEqual(txJson.payload.amount, '1000');
      should.deepEqual(txJson.payload.memo, 'This is an example');
      should.deepEqual(txJson.from, testData.TX_SENDER.address);
      should.deepEqual(txJson.nonce, 0);
      should.deepEqual(txJson.fee.toString(), '180');
    });

    it('a multisig transfer transaction', async () => {
      const builder = initTxBuilder();
      builder.network(new StacksTestnet());
      builder.memo('test memo');
      builder.numberSignatures(2);
      builder.sign({ key: testData.prv1 });
      builder.sign({ key: testData.prv2 });
      builder.sign({ key: testData.prv3 });
      const tx = await builder.build();
      should.deepEqual(tx.toBroadcastFormat(), testData.MULTI_SIG_SINGED_TRANSACTION);
    });

    it('a transfer transaction signed multiple times', async () => {
      const builder = initTxBuilder();
      builder.memo('test memo');
      builder.numberSignatures(2);
      builder.sign({ key: testData.prv1 });
      builder.sign({ key: testData.prv2 });
      builder.sign({ key: testData.prv3 });
      const tx = await builder.build();
      const txJson = tx.toJson();
      should.deepEqual(tx.signature.length, 3);
      should.deepEqual(txJson.fee.toString(), '180');
      should.deepEqual(txJson.payload.to, testData.TX_RECIEVER.address);
      should.deepEqual(txJson.payload.memo, 'test memo');
      should.deepEqual(txJson.payload.amount, '1000');
    });

    it('a transfer transaction with amount 0', async () => {
      const builder = initTxBuilder();
      builder.amount('0');
      builder.sign({ key: testData.TX_SENDER.prv });
      const tx = await builder.build();
      const txJson = tx.toJson();
      should.deepEqual(txJson.payload.to, testData.TX_RECIEVER.address);
      should.deepEqual(txJson.payload.amount, '0');
      should.deepEqual(txJson.from, testData.TX_SENDER.address);
      should.deepEqual(txJson.fee.toString(), '180');
    });

    describe('serialized transactions', () => {
      it('a non signed transfer transaction from serialized', async () => {
        const builder = factory.from(testData.RAW_TX_UNSIGNED);
        builder.sign({ key: testData.TX_SENDER.prv });
        const tx2 = await builder.build();
        should.deepEqual(tx2.toBroadcastFormat(), testData.SIGNED_TRANSACTION);
        tx2.type.should.equal(TransactionType.Send);
      });

      it('a signed transfer transaction from serilaized', async () => {
        const txBuilder = factory.from(testData.SIGNED_TRANSACTION);
        const tx = await txBuilder.build();
        should.deepEqual(tx.toBroadcastFormat(), testData.SIGNED_TRANSACTION);
        tx.type.should.equal(TransactionType.Send);
      });
    });


    describe('should fail', () => {
      it('a transfer transaction with an invalid key', () => {
        const builder = initTxBuilder();
        should.throws(
          () => builder.sign({ key: 'invalidKey' }),
          e => e.message === 'Unsupported private key',
        );
      });

      it('a transfer transaction with an invalid destination address', () => {
        const txBuilder = factory.getTransferBuilder();
        should.throws(
          () => txBuilder.to('invalidaddress'),
          e => e.message === 'Invalid address',
        );
      });

      it('a transfer transaction with an invalid amount: text value', () => {
        const txBuilder = factory.getTransferBuilder();
        should.throws(
          () => txBuilder.amount('invalidamount'),
          e => e.message === 'Invalid amount',
        );
      });

      it('a transfer transaction with an invalid amount: negative value', () => {
        const txBuilder = factory.getTransferBuilder();
        should.throws(
          () => txBuilder.amount('-5'),
          e => e.message === 'Invalid amount',
        );
      });

      it('a transfer transaction with an invalid memo', async () => {
        const txBuilder = factory.getTransferBuilder();
        should.throws(
          () => txBuilder.memo('This is a memo that is too long for a transaction'),
          e => e.message === 'Memo is too long',
        );
      });
    });
  });
});