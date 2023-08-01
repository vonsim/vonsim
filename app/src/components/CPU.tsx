import type { Byte } from "@vonsim/common/byte";

import { Card } from "@/components/common/Card";
import { CellView } from "@/components/common/CellView";
import { FrequencyPicker } from "@/components/common/FrequencyPicker";
import { Table } from "@/components/common/Table";
import { useTranslate } from "@/hooks/useTranslate";
import { PrimitiveAtom, useAtom, useAtomValue } from "jotai";
import { speedsAtom } from "@/lib/settings";
import { MARAtom, MBRAtom } from "@/simulator/components/bus";
import { aluOperationAtom, flagsAtom, registers } from "@/simulator/components/cpu";

export function CPU({ className }: { className?: string }) {
  const translate = useTranslate();
  const [speeds, setSpeeds] = useAtom(speedsAtom);

  const IP = useAtomValue(registers.IP);
  const SP = useAtomValue(registers.SP);
  const IR = useAtomValue(registers.IR);
  const MAR = useAtomValue(MARAtom);
  const MBR = useAtomValue(MBRAtom);
  const operation = useAtomValue(aluOperationAtom);
  const left = useAtomValue(registers.left);
  const right = useAtomValue(registers.right);
  const result = useAtomValue(registers.result);
  const flags = useAtomValue(flagsAtom);

  return (
    <Card title={translate("cpu.name")} className={className}>
      <div className="flex">
        <FrequencyPicker
          className="px-4 py-2"
          value={speeds.cpu}
          onChange={(hz: number) => setSpeeds({ ...speeds, cpu: hz })}
          options={[1, 2, 4, 8, 16, 32, 64]}
        />

        <div className="px-4 py-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {translate("cpu.interrups.label")}
          </label>
          <p>{translate(`cpu.interrups.${flags.interrupts ? "enabled" : "disabled"}`)}</p>
        </div>
      </div>

      <hr />

      <div className="flex flex-wrap justify-center gap-4 p-4">
        <Card title={translate("cpu.general-registers")}>
          <Table className="w-full">
            <Table.Head>
              <Table.ColLabel />
              <Table.ColLabel>L</Table.ColLabel>
              <Table.ColLabel>H</Table.ColLabel>
            </Table.Head>
            <Table.Body>
              <GPRegister name="AX" atom={registers.AX} />
              <GPRegister name="BX" atom={registers.BX} />
              <GPRegister name="CX" atom={registers.CX} />
              <GPRegister name="DX" atom={registers.DX} />
            </Table.Body>
          </Table>
        </Card>

        <Card title={translate("cpu.special-registers")}>
          <Table className="w-full">
            <Table.Body>
              <Table.Row>
                <Table.RowLabel>IP</Table.RowLabel>
                <Table.Cell>{IP.toString("hex")}h</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.RowLabel>SP</Table.RowLabel>
                <Table.Cell>{SP.toString("hex")}h</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.RowLabel>IR</Table.RowLabel>
                <Table.Cell>{IR.toString("bin")}b</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.RowLabel>MAR</Table.RowLabel>
                <Table.Cell>{MAR.toString("hex")}h</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.RowLabel>MBR</Table.RowLabel>
                <Table.Cell>{MBR.toString("hex")}h</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </Card>

        <Card title={translate("cpu.alu")}>
          <div className="grid w-min grid-cols-[3ch_17ch] gap-x-2 p-2 font-mono">
            <div className="row-span-2 self-end text-right font-bold text-slate-800">
              {operation}
            </div>
            <div className="text-left text-slate-600">
              {left.high.toString("bin")} {left.low.toString("bin")}
            </div>
            <div className="text-left text-slate-600">
              {right.high.toString("bin")} {right.low.toString("bin")}
            </div>
            <span />
            <div className="border-t" />
            <span />
            <div className="text-left text-slate-600">
              {result.high.toString("bin")} {result.low.toString("bin")}
            </div>
          </div>
          <hr />
          <Table className="w-full">
            <Table.Head>
              <Table.ColLabel>C</Table.ColLabel>
              <Table.ColLabel>O</Table.ColLabel>
              <Table.ColLabel>S</Table.ColLabel>
              <Table.ColLabel>Z</Table.ColLabel>
            </Table.Head>
            <Table.Body>
              <Table.Row>
                <Table.Cell>{flags.carry ? "1" : "0"}</Table.Cell>
                <Table.Cell>{flags.zero ? "1" : "0"}</Table.Cell>
                <Table.Cell>{flags.sign ? "1" : "0"}</Table.Cell>
                <Table.Cell>{flags.overflow ? "1" : "0"}</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </Card>
      </div>
    </Card>
  );
}

function GPRegister({ name, atom }: { name: string; atom: PrimitiveAtom<Byte<16>> }) {
  const translate = useTranslate();
  const value = useAtomValue(atom);

  return (
    <Table.Row>
      <Table.RowLabel>{name}</Table.RowLabel>
      <Table.Cell className="w-byte p-0">
        <CellView name={translate("cpu.register", `${name[0]}L`)} value={value.low} />
      </Table.Cell>
      <Table.Cell className="w-byte p-0">
        <CellView name={translate("cpu.register", `${name[0]}H`)} value={value.high} />
      </Table.Cell>
    </Table.Row>
  );
}
