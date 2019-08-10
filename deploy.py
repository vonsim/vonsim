#!/usr/bin/env python3
import os
import sys
import argparse

def replace_string_in_file(file_path,target,replacement):
  with open(file_path,'r') as f:
      replaced_contents=f.read().replace(target, replacement)
  with open(file_path, 'w') as f:
      f.write(replaced_contents)

def makedirs_ifnot(path):
  if not os.path.exists(path):
    print("'{}' path does not exist. Creating folder...".format(path))
    os.makedirs(path)

parser = argparse.ArgumentParser()
parser.add_argument('output',help='path where the app is deployed to')
args=parser.parse_args()
output_folder=args.output
makedirs_ifnot(output_folder)

if os.path.isfile(output_folder):
  sys.exit("output path must be a folder")
print("Note: this command must be executed from the root of the sbt project")
print("Deploying to '{}'".format(output_folder))


import subprocess
import time

def wait_for_output(process,output):
  encoding='utf-8'
  line=proc.stdout.readline().decode(encoding).strip()
  print(line)
  while not line.startswith(output):
    time.sleep(1)
    line=proc.stdout.readline().decode(encoding).strip()
    print(line)


print("Compiling with SBT...")
proc = subprocess.Popen('sbt fullOptJS',shell=True)
proc.wait()
print("Moving files to {}...".format(args.output))

from distutils import dir_util,file_util

assets_folder='assets'
output_assets_folder=os.path.join(output_folder,assets_folder)
makedirs_ifnot(output_assets_folder)
print("Moving assets folder from '{}' to '{}'...".format(assets_folder,output_assets_folder))

dir_util.copy_tree(assets_folder,output_assets_folder)

compiled_js_folder='target/scala-2.11'
output_compiled_js_folder=os.path.join(output_folder,compiled_js_folder)
makedirs_ifnot(output_compiled_js_folder)

compiled_js_file=os.path.join(compiled_js_folder,'vonsim-opt.js')
compiled_js_file_map=compiled_js_file+".map"
output_compiled_js_file=os.path.join(output_folder,compiled_js_file)
output_compiled_js_file_map=os.path.join(output_folder,compiled_js_file_map)
print("Moving compiled js file to '{}' and source map to '{}'...".format(compiled_js_file,compiled_js_file_map))
file_util.copy_file(compiled_js_file,output_compiled_js_file)
file_util.copy_file(compiled_js_file_map,output_compiled_js_file_map)
index_path=os.path.join(output_assets_folder,'index.html')
print("Replacing fastopt.js for opt.js in {}".format(index_path))
replace_string_in_file(index_path,'fastopt.js','opt.js')

