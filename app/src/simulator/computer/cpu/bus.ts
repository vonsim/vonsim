/**
 * @fileoverview
 * This file contains the logic to paint movement of data between registers
 * inside the CPU. These paths are stored in a undirected graph, and the
 * shortest path between two registers is calculated using a simple BFS.
 *
 * It doesn't require Dijkstra's algorithm because there is only one path
 * between any two registers.
 *
 * I've used graphology because seems to be the most popular graph library
 * for JS, and it's well documented.
 *
 * Also, there are two internal buses in the CPU: the big "data bus" and
 * very small "address bus". This is because of how they are represented
 * visually in the diagram, but they are similar.
 *
 * @see {@link https://graphology.github.io/}
 */

import type { MARRegister, PhysicalRegister } from "@vonsim/simulator/cpu";
import { UndirectedGraph } from "graphology";
import { bidirectional } from "graphology-shortest-path/unweighted";

type Node = { position: [x: number, y: number] };

const dataBus = new UndirectedGraph<Node>({ allowSelfLoops: false });

// These are the endpoints of the bus
dataBus.addNode("MBR", { position: [610, 250] });
dataBus.addNode("AX", { position: [522, 45] });
dataBus.addNode("BX", { position: [522, 85] });
dataBus.addNode("CX", { position: [522, 125] });
dataBus.addNode("DX", { position: [522, 165] });
dataBus.addNode("id", { position: [522, 205] });
dataBus.addNode("IP", { position: [451, 309] });
dataBus.addNode("SP", { position: [451, 349] });
dataBus.addNode("ri", { position: [451, 388] });
dataBus.addNode("result", { position: [370, 130] });
dataBus.addNode("FLAGS", { position: [250, 225] });
dataBus.addNode("IR", { position: [205, 272] });
dataBus.addNode("left", { position: [60, 85] });
dataBus.addNode("right", { position: [60, 145] });

// These are the intermediate nodes
dataBus.addNode("AX join", { position: [492, 45] });
dataBus.addNode("BX join", { position: [492, 85] });
dataBus.addNode("CX join", { position: [492, 125] });
dataBus.addNode("DX join", { position: [492, 165] });
dataBus.addNode("id join", { position: [492, 205] });
dataBus.addNode("data mbr join", { position: [492, 250] });
dataBus.addNode("IP join", { position: [421, 309] });
dataBus.addNode("SP join", { position: [421, 349] });
dataBus.addNode("ri join", { position: [421, 388] });
dataBus.addNode("addresses mbr join", { position: [421, 250] });
dataBus.addNode("result mbr join", { position: [370, 250] });
dataBus.addNode("FLAGS mbr join", { position: [250, 250] });
dataBus.addNode("IR mbr join", { position: [205, 250] });
dataBus.addNode("left join", { position: [30, 85] });
dataBus.addNode("right join", { position: [30, 145] });
dataBus.addNode("operands mbr join", { position: [30, 250] });

// These are the lines
dataBus.addUndirectedEdge("AX", "AX join");
dataBus.addUndirectedEdge("BX", "BX join");
dataBus.addUndirectedEdge("CX", "CX join");
dataBus.addUndirectedEdge("DX", "DX join");
dataBus.addUndirectedEdge("id", "id join");
dataBus.addUndirectedEdge("AX join", "BX join");
dataBus.addUndirectedEdge("BX join", "CX join");
dataBus.addUndirectedEdge("CX join", "DX join");
dataBus.addUndirectedEdge("DX join", "id join");
dataBus.addUndirectedEdge("id join", "data mbr join");
dataBus.addUndirectedEdge("data mbr join", "MBR");

dataBus.addUndirectedEdge("IP", "IP join");
dataBus.addUndirectedEdge("SP", "SP join");
dataBus.addUndirectedEdge("ri", "ri join");
dataBus.addUndirectedEdge("IP join", "SP join");
dataBus.addUndirectedEdge("SP join", "ri join");
dataBus.addUndirectedEdge("IP join", "addresses mbr join");
dataBus.addUndirectedEdge("addresses mbr join", "data mbr join");

dataBus.addUndirectedEdge("result", "result mbr join");
dataBus.addUndirectedEdge("result mbr join", "addresses mbr join");

dataBus.addUndirectedEdge("FLAGS", "FLAGS mbr join");
dataBus.addUndirectedEdge("FLAGS mbr join", "result mbr join");

dataBus.addUndirectedEdge("IR", "IR mbr join");
dataBus.addUndirectedEdge("IR mbr join", "FLAGS mbr join");

dataBus.addUndirectedEdge("left", "left join");
dataBus.addUndirectedEdge("right", "right join");
dataBus.addUndirectedEdge("left join", "right join");
dataBus.addUndirectedEdge("right join", "operands mbr join");
dataBus.addUndirectedEdge("operands mbr join", "IR mbr join");

export type DataRegister = PhysicalRegister | "MBR";

/**
 * Given two registers, returns the shortest path between them.
 * These registers must belong to {@link DataRegister}.
 * @returns The path as a SVG path.
 * @throws If there is no path between the two registers.
 */
export function generateDataPath(from: DataRegister, to: DataRegister): string {
  const path = bidirectional(dataBus, from, to);
  if (!path) throw new Error(`No path from ${from} to ${to}`);

  const start = dataBus.getNodeAttribute(path[0], "position");
  let d = `M ${start[0]} ${start[1]}`;

  for (let i = 1; i < path.length; i++) {
    const [x, y] = dataBus.getNodeAttribute(path[i], "position");
    d += ` L ${x} ${y}`;
  }

  return d;
}

// ============================================================================

const addressBus = new UndirectedGraph<Node>({ allowSelfLoops: false });

// These are the endpoints of the bus
addressBus.addNode("MAR", { position: [598, 349] });
addressBus.addNode("IP", { position: [551, 309] });
addressBus.addNode("SP", { position: [551, 349] });
addressBus.addNode("ri", { position: [544, 388] });

// These are the intermediate nodes
addressBus.addNode("IP join", { position: [575, 309] });
addressBus.addNode("SP join", { position: [575, 349] });
addressBus.addNode("ri join", { position: [575, 388] });

// These are the lines
addressBus.addUndirectedEdge("IP", "IP join");
addressBus.addUndirectedEdge("SP", "SP join");
addressBus.addUndirectedEdge("ri", "ri join");
addressBus.addUndirectedEdge("IP join", "SP join");
addressBus.addUndirectedEdge("ri join", "SP join");
addressBus.addUndirectedEdge("SP join", "MAR");

export type { MARRegister as AddressRegister };

/**
 * Given an {@link MARRegister}, returns the shortest path between it
 * and the MAR register.
 * @returns The path as a SVG path.
 * @throws If there is the register isn't valid.
 */
export function generateAddressPath(from: MARRegister): string {
  const path = bidirectional(addressBus, from, "MAR");
  if (!path) throw new Error(`Invalid register ${from}`);

  const start = addressBus.getNodeAttribute(path[0], "position");
  let d = `M ${start[0]} ${start[1]}`;

  for (let i = 1; i < path.length; i++) {
    const [x, y] = addressBus.getNodeAttribute(path[i], "position");
    d += ` L ${x} ${y}`;
  }

  return d;
}
