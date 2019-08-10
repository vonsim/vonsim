#!/usr/bin/env python3
import os
import sys
import argparse
import shutil

def replace_string_in_file(file_path,target,replacement):
  with open(file_path,'r') as f:
      replaced_contents=f.read().replace(target, replacement)
  with open(file_path, 'w') as f:
      f.write(replaced_contents)

def makedirs_ifnot(path):
  if not os.path.exists(path):
    print("'{}' path does not exist. Creating folder...".format(path))
    os.makedirs(path)

def list_files_recursive(path):
  result=[]
  for root,dirs,files in os.walk(path):
    for f in files:
      fullpath=os.path.join(root,f)
      relpath=os.path.relpath(fullpath, path)
      result.append(relpath)

  return result
# result = [os.path.join(dp, f) for dp, dn, filenames in os.walk(PATH) for f in filenames if os.path.isfile(f)]

parser = argparse.ArgumentParser()
parser.add_argument('output',help='path where the scorm app is deployed to')
args=parser.parse_args()
output_folder=args.output
makedirs_ifnot(output_folder)

if os.path.isfile(output_folder):
  sys.exit("output path must be a folder")
print("Output path set to: '{}'".format(output_folder))
print("#1# Calling deploy script\n\n")

from subprocess import call
call(["./deploy.py", output_folder])
resources=list_files_recursive(output_folder)

resources_string=""
for r in resources:
  resources_string+='<file href="{}"/>\n'.format(r)
print(resources_string)

print("#2# Generating SCORM files\n\n")
# Copy imsmanifest.xml to output folder
manifest_name='imsmanifest.xml'
input_scorm_filepath=os.path.join('scorm/',manifest_name)
output_scorm_filepath=os.path.join(output_folder,manifest_name)
shutil.copyfile(input_scorm_filepath,output_scorm_filepath)

replace_string_in_file(output_scorm_filepath,'XXRESOURCESXX',resources_string)
