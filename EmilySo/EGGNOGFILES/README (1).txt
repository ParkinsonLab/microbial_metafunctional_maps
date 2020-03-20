* Common Terminology * 
=========================

** Common terms **
--------------------

- group = Cluster of Orthologous Group

- "eggnog taxonomic level" or "eggnog level" or just "level" = Taxonomic
  restriction used to build the clusters of orthologous groups. Thus, euNOG
  level groups will only contain eukaryotic sequences, maNOG only mammal
  sequences, and so on

** Orthologous Group (OG) name format **
------------------------------------------

- ENOG41xxxxx = Unsupervised Cluster of Orthologous Group (present in all levels)
 
- COGxxxxx = Supervised Cluster of Universal Orthologous Group (present only
   within the root NOG level -aka LUCA level- )
- KOG = Supervised Cluster of Eukaryotic Orthologous Group (present only within
   the euNOG level)
- arCOGxxxxx = Supervised Cluster of Archeal Orthologous Group (present only
   within the arNOG level) 

* Main Directory Structure *
=========================
eggnog4.functional_categories.txt            -> COG functional category names 
eggnog4.protein_id_conversion.tsv.gz         -> All available conversions for gene and protein names
eggnog4.proteins.all.fa.gz                   -> All protein sequences
eggnog4.proteins.core_periphery.fa.gz        -> All protein sequences from core
                                                and periphery species (the ones
                                                present in cannonical 
                                                groups and listed as members)
eggnog4.species_list.txt                     -> List of all species considered
eggnog4.taxonomic_levels.txt                 -> Definition of Taxonomic Levels 
data/
   {TaxonomicLevel}/
      {TaxonomicLevel}.members.tsv.gz        -> Content of each group (protein list)
      {TaxonomicLevel}.annotations.tsv.gz    -> Functional annotation associated with each group
      {TaxonomicLevel}.trees.tsv.gz          -> Phylogenetic tree of each group
      {TaxonomicLevel}.hmm.tar.gz            -> HMM models for each group alignment
      {TaxonomicLevel}.raw_algs.tar.gz       -> Raw sequence alignments for each group
      {TaxonomicLevel}.trimmed_algs.tsv.gz   -> Trimmed sequence alignment for each group (used for phylogenetic inference)


* File Format Details *
=========================

** functional annotation files ** 
------------------------------------
Tab delimited files, each line containing the following data:

TaxonomicLevel | GroupName | ProteinCount | SpeciesCount | COGFunctionalCategory | ConsensusFunctionalDescription

** members files **
--------------------
Tab delimited files, each line representing:

TaxonomicLevel|GroupName|ProteinCount|SpeciesCount|COGFunctionalCategory|ProteinIDs

ProteinIds format = Taxid.SeqID

** raw_alg, trimmed_alg and hmm files **
-----------------------------------------

Tar files containing a file per group. 

File name format: TaxonomicLevel.GroupName.{method}.{fa|hmm}

where {method} represent the methodology used to generate the raw alignments: 
      meta = meta alignment strategy. Several aligners tested on head/tail
      order and conensus obtained with Mcoffee 
      clustalo = ClustalOmega alignment with defailt parameters 
      mafft = Mafft with default parameters (used only for huge alignments) 
      
** tree files **
-------------------
Tab delimited files, each line representing the phylogenetic tree of an ortholgous group. 

GroupName | PhylogeneticInferenceMethod | SequenceAlignmentMethod | NewickTree


** OG_hierarchies.tsv ** 
------------------------
This file represents the hierarchical connections of each OG in every taxonomic
level. It is a tab-delimited file with the following columns:
1.OG name at the root taxonomic level (LUCA) 
2.number of children OGs
3.list of children OGs
4.actual hierarchy of OGs in newick format

Notes:
- OGs are referred using the the format "OGCode@TaxonomicLevel". 
- Cannonical OG names (as shown in the website) are form as ENOG41[OGCode] if
  the OGCode is not a COG, arCOG or KOG. 
