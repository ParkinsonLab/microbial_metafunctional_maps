#!/usr/bin/env python

import psycopg2
import sys
import decimal
string_connection = psycopg2.connect(user = "meta_user",
                              password = "",
                              host = "localhost",
                              port = "5432",
                              database = "string_sample_tables")

string_cursor = string_connection.cursor()
# READING FROM INPUT FILE 
eggnog_connection = psycopg2.connect(user = "meta_user",
                              password = "",
                              host = "localhost",
                              port = "5432",
                              database = "eggnog_sample_tables")
eggnog_cursor = eggnog_connection.cursor()
#adjusting the input data
# with open("/path/to/Emily_Stable.txt","r") as file_2, \
open("/path/to/new_input_data.txt","w") as out:
	next(file_2)
	for line in file_2:
		line_split = line.split('\t')
		description = line_split[1].split('|')
		if len(description) >= 9:
			locus = description[8]
			name = description[6]
		else:
			locus = "N/A"
			name = description[4]
		strain = line_split[4]
		genus = line_split[5]
		supergroup = line_split[9]
		refseq = description[3]
		ncbi_taxid = line_split[3]
		out.write(refseq+'\t'+ncbi_taxid+'\t'+locus+'\t'+name+'\t'+strain+'\t'+genus+'\t'+supergroup+'\n')
		out.flush()
		string_cursor.execute("COPY input_data FROM '/path/to/new_input_data.txt' (FORMAT csv, DELIMITER E'\t')")

#transitioning refseq to string with the conversion in an output file 
with open("/path/to/refseq_to_string.txt","w") as file_1:
  file_1.write("refseq_id" + "\t" + "ncbi_taxid\tstring_id\n")
  file_1.flush()
  string_cursor.execute("SELECT refseq,ncbi_taxid FROM input_data")
  refseqs = string_cursor.fetchall()
  if refseqs != None:
  		print("Here")
	  	for refseq_id in refseqs:
		  	edited_refseq_id = (refseq_id[0].split("."))[0]
		  	string_cursor.execute("SELECT string_id FROM refseq_to_string WHERE refseq_id='%s'" % edited_refseq_id)
		  	string_id = string_cursor.fetchone()
			if (string_id != None):
				print("Hello")
				file_1.write(edited_refseq_id + '\t' + refseq_id[1] + '\t' + string_id[0] + '\n')
				file_1.flush()

# finding Gene Ontology ID using the string ids extracted from the input file - this has not been fully tested
with open("/path/to/refseq_to_string.txt","r") as infile_1, open("/path/to/string_gene_ontology","w") as file_2:
  file_2.write("string id\tncbi tax id\tGene Ontology ID\tcategory ")
  file_2.flush()
  for line in infile_1:
    line_split = line.split("\t")
    string_id = (line_split[2].split("\n"))[0]
    ncbi_taxid = line_split[1]
    print(string_id)
    string_cursor.execute("SELECT * FROM go_to_string WHERE string_id='%s'" % string_id)
    fetched = string_cursor.fetchall()
    if (fetched != None):
      for fetch in fetched:
	      file_2.write(string_id+'\t'+ ncbi_taxid + '\t' + fetch[2]+'\t'+fetch[1] + '\n')
	      file_2.flush()

#retrieving more information about Gene Ontology IDs
with open("/path/to/string_gene_ontology","r") as infile_2, open("/path/to/full_gene_ontology_info.txt","w") as file_3:
	file_3.write("ncbi tax id\tstring id\tGene Ontology ID\tcategory\tdescription\n")
	file_3.flush()
	next(infile_2)
	for line in infile_2:
		line_split = line.split('\t')
		string_id = line_split[0]
		ncbi_taxid = line_split[1]
		go_id = line_split[2]
		string_cursor.execute("SELECT role,description FROM gene_ontology_keywords WHERE go_term='%s'"%go_id)
		fetched = string_cursor.fetchone()
		if fetched != None:
			role = fetched[0]
			description = fetched[1]
			file_3.write(ncbi_taxid+'\t'+string_id+'\t'+go_id+'\t'+role+'\t'+description+'\n')
			file_3.flush()

#converting refseq to enog
with open("/path/to/refseq_to_string.txt","r") as infile_1, open("/path/to/refseq_to_enog.txt","w") as outfile:
  outfile.write("string_id\tgroupid\tcog_category\tdescription\n")
  outfile.flush()
  next(infile_1)
  for line in infile_1:
    line_split = line.split('\t')
    refseq_id = line_split[0]
    string_id = (line_split[2].split("\n"))[0]
    string_cursor.execute("SELECT uniprot FROM refseq_to_uniprot WHERE refseq='%s'" % refseq_id)
    uniprot = string_cursor.fetchone()
    if uniprot != None:
      eggnog_cursor.execute("SELECT luca_og,bact_og FROM uniprot_to_og WHERE uniprot_id='%s'" % uniprot[0])
      ogs = eggnog_cursor.fetchone()
      if ogs != None:
        print("OG:%s" % ogs[1])
        if (ogs[1] == "-"):
          print(string_id,ogs[0])
          print("Nope")
          sys.stdout.flush()
          outfile.write(string_id + '\t' + ogs[0] + '\tN/A\tN/A\n')
          outfile.flush()
        else:
          sys.stdout.flush()
          eggnog_cursor.execute("SELECT cog_category,description FROM bactnog_annotations WHERE group_id='%s'" % ogs[1])
          cog = eggnog_cursor.fetchone()
          if cog != None:
            print
            print(cog[0],cog[1])
            outfile.write(string_id + '\t' + ogs[1] + '\t' + cog[0] + '\t' + cog[1] + '\n')
            outfile.flush()

#retrieving annotations and protein descriptions
with open("/path/to/refseq_to_enog.txt","r") as infile, open("/path/to/finding_bactnog_proteins.txt","w") as outfile:
  outfile.write("string_protein" + ":" + "enog_id" + ":proteincount:speciescount:cog_category:description:" + "proteinds\n")
  outfile.flush()
  next(infile)
  for line in infile:
    line_split = line.split("\t")
    description = (line_split[3].split("\n"))[0]
    group_id = line_split[1]
    string_protein = line_split[0]
    cogcategory = line_split[2]
    eggnog_cursor.execute("SELECT proteincount,speciescount FROM bactnog_annotations WHERE group_id='%s'"%group_id)
    first_fetch = eggnog_cursor.fetchone()
    eggnog_cursor.execute("SELECT proteinids FROM bactnog_members WHERE group_id='%s'" % group_id)
    second_fetch = eggnog_cursor.fetchone()
    if (second_fetch != None):
      print("Got Through")
      sys.stdout.flush()
      outfile.write(string_protein + ':' + group_id + ':' + str(first_fetch[0]) + ':' + str(first_fetch[1]) +':' + cogcategory + ':' + description + ':' + second_fetch[0] + '\n')
      outfile.flush()

#finding all the interacting proteins of the proteins in the input data  
with open("/path/to/refseq_to_enog.txt","r") as infile_1, \
open("/path/to/refseq_to_enog_with_interactions.txt","w") as outfile:
  outfile.write("ncbi taxid\trefseq id\tstring_id\tgroupid\tcog_category\tinteracting protein\tinteracting protein cog\n")
  outfile.flush()
  next(infile_1)
  for line in infile_1:
    line_split = line.split('\t')
    string_id = line_split[0]
    group_id = line_split[1]
    cog_category = line_split[2]
    description = line_split[3]
    string_cursor.execute("SELECT DISTINCT protein_b FROM protein_interaction_data WHERE protein_a='%s'" % string_id)
    fetched = string_cursor.fetchall()
    string_cursor.execute("SELECT ncbi_taxid,refseq_id FROM refseq_to_string WHERE string_id='%s'"%string_id)
    refseq_tax = string_cursor.fetchone()
    if fetched != None:
      for fetch in fetched:
          call = "SELECT group_id FROM bactnog_members WHERE proteinids LIKE" +"'%" + fetch[0] + "%'"
          eggnog_cursor.execute(call)
          cluster = eggnog_cursor.fetchone()
          if cluster != None:
            outfile.write(refseq_tax[0] + '\t' + refseq_tax[1] + '\t'+ string_id + '\t' + group_id + '\t' + cog_category + '\t' + fetch[0] +  '\t' + cluster[0] + '\n')
          else:
            outfile.write(refseq_tax[0] + '\t' + refseq_tax[1] + '\t'+ string_id + '\t' + group_id + '\t'+ cog_category + '\t' + fetch[0] +  '\t' + "N/A" + '\n')
    else:
      outfile.write(refseq_tax[0] + '\t' + refseq_tax[1] + '\t'+ string_id+'\t'+group_id+'\t'+cog_category+'\t'+"N/A\t"+"N/A\n")


## all the processes for making the taxonomic ratios 

with open("/path/to/finding_bactnog_proteins.txt","r") as countingfile,\
open("/path/to/members_by_tax_id.txt",'w') as outputfile:
	outputfile.write("cluster\ttaxidmembers\n")
	outputfile.flush()
	next(countingfile)
	for line in countingfile:
		family_string = ''
		line_split = line.split(':')
		cluster = line_split[1]
		eggnog_cursor.execute("SELECT proteincount FROM bactnog_members WHERE group_id='%s'" % cluster)
		count = eggnog_cursor.fetchone()
		if count != None:
			proteincount = str(count[0])
			print("Protein_count:"+proteincount+'\n')
			sys.stdout.flush()
			proteins = ((line_split[6]).split('\n'))[0]
			protein_split = proteins.split(',')
			for protein in protein_split:
				string_cursor.execute("SELECT ncbi_taxid FROM refseq_to_string WHERE string_id='%s'"%protein)
				tax_id = string_cursor.fetchone()
				if tax_id != None:
					print("Tax ID:%s"%tax_id[0])
					print("STRING:%s"%protein)
					family_string += tax_id[0] + ","
					print(len(family_string.split(',')))
			sys.stdout.flush()
			print("FAMILY STRIN: %s"%family_string)
			outputfile.write(cluster+'\t'+family_string+'\n')
			outputfile.flush()
#creating taxonomic ratios for OG by family 
with open("/path/to/family_ratios.txt","w") as outfile,\
open("/path/to/new_members_by_tax_id.txt","r") as infile:
	outfile.write("eggnog_id\ttaxid\tnumber\n")
	outfile.flush()
	genus_dict = {}
	next(infile)
	for line in infile:
		line_split = line.split('\t')
		cluster = line_split[0]
		eggnog_cursor.execute("SELECT proteincount FROM bactnog_annotations WHERE group_id='%s'"%cluster)
		count = (eggnog_cursor.fetchone())[0]
		if cluster not in genus_dict:
			genus_dict[cluster] = {}
		proteinids = ((line_split[1]).split('\n'))[0]
		proteins = proteinids.split(',')
		print(cluster)
		sys.stdout.flush()
		for protein in proteins:
			eggnog_cursor.execute("SELECT taxid_lineage FROM eggnog_taxonomic_classification WHERE ncbi_taxid='%s'"%protein)
			lineage = eggnog_cursor.fetchone()
			if lineage != None:
				protein_list = (lineage[0]).split(',')
				eggnog_cursor.execute("SELECT ncbi_taxid FROM direct_taxonomic_levels WHERE level='family'")
				fetched = eggnog_cursor.fetchall()
				if fetched != None:
					for fetch in fetched:
						if fetch[0] in protein_list:
							sys.stdout.flush()
							if fetch[0] not in genus_dict[cluster]:
								genus_dict[cluster][fetch[0]] = 0
							genus_dict[cluster][fetch[0]] += 1
		sys.stdout.flush()
		for key in genus_dict[cluster]:
			print("DICTIONARY")
			sys.stdout.flush()
			sys.stdout.flush()
			outfile.write(cluster+'\t'+key+'\t'+str(decimal.Decimal(str(genus_dict[cluster][key]))/decimal.Decimal(str(count)))+'\n')
			outfile.flush()
#creating ratios for OGs by genus 
with open("/path/to/genus_ratios.txt","w") as outfile,\
open("/path/to/new_members_by_tax_id.txt","r") as infile:
	outfile.write("eggnog_id\ttaxid\tnumber\n")
	outfile.flush()
	genus_dict = {}
	next(infile)
	for line in infile:
		line_split = line.split('\t')
		cluster = line_split[0]
		eggnog_cursor.execute("SELECT proteincount FROM bactnog_annotations WHERE group_id='%s'"%cluster)
		count = (eggnog_cursor.fetchone())[0]
		if cluster not in genus_dict:
			genus_dict[cluster] = {}
		proteinids = ((line_split[1]).split('\n'))[0]
		proteins = proteinids.split(',')
		print(cluster)
		sys.stdout.flush()
		for protein in proteins:
			eggnog_cursor.execute("SELECT taxid_lineage FROM eggnog_taxonomic_classification WHERE ncbi_taxid='%s'"%protein)
			lineage = eggnog_cursor.fetchone()
			if lineage != None:
				protein_list = (lineage[0]).split(',')
				eggnog_cursor.execute("SELECT ncbi_taxid FROM direct_taxonomic_levels WHERE level='genus'")
				fetched = eggnog_cursor.fetchall()
				if fetched != None:
					for fetch in fetched:
						if fetch[0] in protein_list:
							sys.stdout.flush()
							if fetch[0] not in genus_dict[cluster]:
								genus_dict[cluster][fetch[0]] = 0
							genus_dict[cluster][fetch[0]] += 1
		sys.stdout.flush()
		for key in genus_dict[cluster]:
			print("DICTIONARY")
			sys.stdout.flush()
			sys.stdout.flush()
			outfile.write(cluster+'\t'+key+'\t'+str(decimal.Decimal(str(genus_dict[cluster][key]))/decimal.Decimal(str(count)))+'\n')
			outfile.flush()

#creating the output data 
with open("/path/to/refseq_to_enog_with_interactions.txt","r") as inputfile,\
open("/path/to/final_output_info.txt",'w') as outputfile:
	outputfile.write("refseq\tncbi_taxid\tlocus\tname\tstrain\tgenus\tsupergroup\tgroupid\tcog_category\tinteracting protein\tinteracting protein cog")
	for line in inputfile:
		line_split = line.split('\t')
		string_id = line_split[2]
		string_cursor.execute("SELECT refseq_id FROM refseq_to_string WHERE string_id='%s'"% string_id)
		fetch = string_cursor.fetchone()
		if fetch != None:
			sql_statement = "SELECT * FROM input_data WHERE refseq LIKE '%" + fetch[0] + "%'"
			string_cursor.execute(sql_statement)
			info = string_cursor.fetchone()
			if info != None:
				string = ''
				for input in info:
					string += input+'\t'
				string_split = line.split(string_id)
				outputfile.write(string+string_id+'\t'+string_split[1])
				outputfile.flush()
# with open()
string_cursor.close()
string_connection.commit()
eggnog_cursor.close()
eggnog_connection.commit()




