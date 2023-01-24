import { shallow } from "zustand/shallow";

import { useSimulator } from "@/simulator";

import { useTranslate } from "../hooks/useTranslate";
import { Card } from "./common/Card";
import { Table } from "./common/Table";

export function Timer({ className }: { className?: string }) {
  const translate = useTranslate();

  const { CONT, COMP } = useSimulator(
    state => ({
      CONT: state.devices.timer.CONT,
      COMP: state.devices.timer.COMP,
    }),
    shallow,
  );

  return (
    <Card title={translate("devices.internal.timer")} className={className}>
      <Table
        columns={["CONT", "COMP"]}
        rows={[
          {
            cells: [
              {
                content: CONT,
                renderMemory: true,
                title: translate("devices.ioRegister", "CONT", 0x10),
              },
              {
                content: COMP,
                renderMemory: true,
                title: translate("devices.ioRegister", "COMP", 0x11),
              },
            ],
          },
        ]}
      />
    </Card>
  );
}
