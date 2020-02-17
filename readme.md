Create a .env file
and add:

```
# use ./TestData.csv for file path to see how things works
FILE_PATH=<filepath>
OUTPUT_DIR=./output_files
```

where filepath is in relation to the root directory of this app

After creating .env file

```
npm start
```

will build all the files

```
npm display:chord

```

will generate the chord diagram

To create a new TeamGenerator you need to create a Parser class that creates data in the form of Entry[],
You also need to create an updateGraph function that updates the adjacency matrix, nodeList, and edgeList.
TeamGenerator.generateGraph takes the list of entries and feeds it into a custom updateGraph function.
The upateGraph function must be tailored to the shape of data coming in so its included as a parameter in the constructor.
amchartEdgeList is neccessary to display the chord diagram
