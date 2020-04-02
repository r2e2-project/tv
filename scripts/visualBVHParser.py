import argparse
import ast
import json 
from tqdm import tqdm
def parse_bvh_node_line(line: str):
	line_dict = {}
	parsed_line = line.strip("][")
	parsed_line = parsed_line.strip("],\n")
	list_line = parsed_line
		
	node_start_idx = 0
	node_end_idx = list_line.rfind(",Bounds")
	node_section = list_line[node_start_idx:node_end_idx].split(":")
	line_dict[node_section[0]] = int(node_section[1])
	
	bounds_start_idx = node_end_idx + 1
	bounds_end_idx = list_line.rfind(",2COffset")
	bounds_section = list_line[bounds_start_idx:bounds_end_idx].split(":")
	line_dict[bounds_section[0]] = ast.literal_eval(bounds_section[1].strip(" "))
	
	childOffset_start_idx = bounds_end_idx + 1
	childOffset_end_idx = list_line.rfind(",depth")
	childOffset_section = list_line[childOffset_start_idx:childOffset_end_idx].split(":")
	line_dict[childOffset_section[0]] = int(childOffset_section[1])
	
	depth_start_idx = childOffset_end_idx + 1
	depth_section = list_line[depth_start_idx:].split(":")
	line_dict[depth_section[0]] = int(depth_section[1])
	
	return line_dict
# print(parse_bvh_node_line(example_line))

def parse_bvh_node_file(filename: str,outname: str):
	# f = open(filename,"r")
	num_lines = sum(1 for line in open(filename,'r'))
	num_lines = num_lines - 1
	# lines = f.readlines()[0:-1]
	# node_list = []
	ctr = 0 
	pbar = tqdm(total=num_lines)
	with open(filename,'r') as fp:
		with open(outname,'a') as outfile:
			line = fp.readline()
			outfile.write("var bvh_nodes = [\n")
			while ctr < num_lines:
				json.dump(parse_bvh_node_line(line),outfile,separators=(',', ':'),indent=0)
				if ctr < num_lines - 1:
					outfile.write(",\n")
				line = fp.readline()
				ctr += 1 
				pbar.update(1)
			outfile.write("]")
	pbar.close()

def parse_treelet_line(line: str):
	line_dict = {}
	parsed_line = line.strip("][,\n")
	
	treelet_start_idx = 0;
	treelet_end_idx = parsed_line.rfind(",nodes:")
	treelet_section = parsed_line[treelet_start_idx:treelet_end_idx].split(":")
	line_dict[treelet_section[0]] = int(treelet_section[1])
	
	node_start_idx = treelet_end_idx + 1
	node_section = parsed_line[node_start_idx:].split(":")
	line_dict[node_section[0]] = ast.literal_eval((node_section[1] + "]").strip(" "))
	
	return line_dict
# print(parse_treelet_line(example_line))
def parse_treelet_file(filename: str,outname: str):
	num_lines = sum(1 for line in open(filename,'r'))
	num_lines = num_lines - 1
	ctr = 0 
	pbar = tqdm(total=num_lines)
	with open(filename,'r') as fp:
		with open(outname,'a') as outfile:
			line = fp.readline()
			outfile.write("var treelet_map = [\n")
			while ctr < num_lines:
				json.dump(parse_treelet_line(line),outfile,separators=(',', ':'),indent=0)
				if ctr < num_lines - 1:
					outfile.write(",\n")
				line = fp.readline()
				ctr += 1 
				pbar.update(1)
			outfile.write("]")
	pbar.close()

def main():
	parser = argparse.ArgumentParser()
	parser.add_argument('--bvhparse', type=argparse.FileType('r'))
	parser.add_argument('--treeletparse', type=argparse.FileType('r'))
	args = parser.parse_args()
	bvh_name = 'bvh_node_dump.js'
	treelet_name = 'treelet_node_map.js'
	if args.treeletparse is not None:
		parse_treelet_file(args.treeletparse.name,treelet_name)
	if args.bvhparse is not None: 
		parse_bvh_node_file(args.bvhparse.name,bvh_name)
		# with open('bvh_node_dump.json', 'w') as outfile:
		# 	json.dump(bvh_node_list,outfile, sort_keys=False, indent=0, separators=(',', ':'))


if __name__ == '__main__':
	main()