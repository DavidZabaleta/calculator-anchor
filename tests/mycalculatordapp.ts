import * as anchor from "@project-serum/anchor";
import { SystemProgram } from "@solana/web3.js"
import * as assert from "assert";
import {BN} from "@project-serum/anchor";

describe('mycalculatordapp', () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);
  const calculator = anchor.web3.Keypair.generate();
  const program = anchor.workspace.Mycalculatordapp;
  const calculatorPublicKey = calculator.publicKey;

  const newBN = (number: number): BN => new BN(number);
  const accountCalculator = async () => await program.account.calculator.fetch(calculatorPublicKey);
  const assertResultCalculator = async (expectedResult: number) => {
    const account = await accountCalculator();

    assert.ok(account.result.eq(newBN(expectedResult)));
  }

  it('should creates a calculator', async () => {
    const expectedMessage = 'Welcome to Solana';

    await program.rpc.create(expectedMessage, {
      accounts: {
        calculator: calculatorPublicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId
      },
      signers: [calculator]
    })

    const account = await accountCalculator();

    assert.ok(account.greeting === expectedMessage);
  });

  it('should add two numbers', async () => {
    await program.rpc.add(newBN(3), newBN(2), {
      accounts: {
        calculator: calculatorPublicKey
      }
    });

    await assertResultCalculator(5);
  });

  it('should subtract two numbers', async () => {
    await program.rpc.subtract(newBN(4), newBN(6), {
      accounts: {
        calculator: calculatorPublicKey
      }
    });

    await assertResultCalculator(-2);
  });

  it('should multiply two numbers', async () => {
    await program.rpc.multiply(newBN(3), newBN(4), {
      accounts: {
        calculator: calculatorPublicKey
      }
    });

    await assertResultCalculator(12);
  });

  it('should divide two numbers', async () => {
    await program.rpc.divide(newBN(19), newBN(5), {
      accounts: {
        calculator: calculatorPublicKey
      }
    });

    const account = await accountCalculator();

    assert.ok(account.result.eq(newBN(3)));
    assert.ok(account.remainder.eq(newBN(4)));
  });
});
