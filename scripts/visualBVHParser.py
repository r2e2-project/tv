import argparse
import ast
import json 

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

def parse_bvh_node_file(filename: str):
    f = open(filename,"r")
    lines = f.readlines()[0:-1]
    node_list = []
    for line in lines:
        node_list.append(parse_bvh_node_line(line))
    return node_list

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
def parse_treelet_file(filename: str):
    file = open(filename,"r")
    lines = file.readlines()[0:-1]
    node_list = []
    for line in lines:
        node_list.append(parse_treelet_line(line))
    return node_list

def main():
	parser = argparse.ArgumentParser()
	parser.add_argument('--bvhparse', type=argparse.FileType('r'))
	parser.add_argument('--treeletparse', type=argparse.FileType('r'))
	args = parser.parse_args()
	if args.bvhparse is not None: 
		bvh_node_list = parse_bvh_node_file(args.bvhparse.name)
		with open('bvh_node_dump.json', 'w') as outfile:
			json.dump(bvh_node_list,outfile, sort_keys=False, indent=0, separators=(',', ':'))
	if args.treeletparse is not None:
		treelet_node_list = parse_treelet_file(args.treeletparse.name)
		with open('treelet_node_map.json', 'w') as outfile:
			json.dump(treelet_node_list, outfile, sort_keys=False,indent=0,separators=(",",":"))

if __name__ == '__main__':
	main()