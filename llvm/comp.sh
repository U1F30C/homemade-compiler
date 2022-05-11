#!/bin/bash

# clang -cc1 foo.c -emit-llvm


llc $1 -filetype obj  -o $1.o
gcc $1.o -no-pie
rm $1.o
