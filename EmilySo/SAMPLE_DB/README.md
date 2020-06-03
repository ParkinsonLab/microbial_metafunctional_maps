#SAMPLE_DB README

eggnog_sample_tables:
	All the PostGres tables in the MicroMeta database containing the information from EGGNOG

family_ratios:
	The ratios for each taxonomic group for representation among families (i.e. the count of how many proteins belong to a family against the total protein count in that group)

final_output_info:
	The tab-delimited file containing all the extracted information from the database for the input proteins

finding_bactnog_proteins:
	for each input protein, showing its corresponding STRING identifier, its orthologous group and the OG's members 

genus_ratios:
	The ratios for each taxonomic group for representation among genera (i.e. the count of how many proteins belong to a genus against the total protein count in that group)

interaction_output_data:
For each input protein, this file shows its corresponding OG, as well as every protein it interacts with and their corresponding OG.

members_by_tax_id:
	for each OG, showing the presence of the input proteins by taxonomic ID

new_input_data:
	the extracted data from Emily_Stable (refer to parent directory) that will be inputted directly into the MicroMeta database

refseq_to_string:
	showing the direct conversion from a protein's Refseq ID to its STRING identifier 

string_sample_tables:
	all the Postgres tables in the MicroMeta Database that contains information from the STRING database

string_to_enog:
	showing each input protein by their STRING identifier, their corresponding OG, and its information 