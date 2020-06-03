#!/usr/bin/env python
import psycopg2
with open("/Users/emilyso/Documents/ThirdYear/BCB330/microbial_metafunctional_maps/EmilySo/Emily_Stable.txt","r") as file_2, \
open("/Users/emilyso/Documents/ThirdYear/BCB330/microbial_metafunctional_maps/EmilySo/new_input_data.txt","w") as out:
	# connection = psycopg2.connect(user = "meta_user",
 #                              password = "",
 #                              host = "localhost",
 #                              port = "5432",
 #                              database = "string_sample_tables")
	# curs = connection.cursor()
	# curs.execute("CREATE TABLE new_input_data(refseq varchar,ncbi_taxid varchar,locus varchar,name varchar,strain varchar,genus varchar,supergroup varchar)")
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
