
3read lets you highlight text and read it on the z-axis.

<iframe 
  width="560"
  height="315" 
  src="https://www.youtube.com/embed/5-lZu53yB4w" 
  frameborder="0"
  allow="autoplay; encrypted-media" 
  allowfullscreen
></iframe>

It utilizes THREE.js. But, in a naive way.
I need your help to improve performance.

checkout this code:

    git clone https://github.com/skyl/3read

Go to [chrome://extensions](chrome://extensions)
and click "Load unpacked extension".
Select the 3read directory that you checked out.
Read the instructions for use.
Almost ready to hack!

Most of the code is written in CoffeeScript.
So, install npm, install coffeescript.
For me, this went:

    brew install npm
    npm install -g coffee-script

Now, I can compile the CoffeeScript in the 3read directory:

    coffee --watch --compile .

Changes you make will now effect the extension.

HELP!

Thank you.
