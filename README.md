This tool allows you to build documentation for your project through XML syntax. 

It can be configured through some settings and different sections of the documentation can be created, which are fully HTML compatible.

To generate the single HTML file output, the source file is passed to doctormake (NPM package):

>doctormake input.xml output.xml

Or manually:

>node doctor.js input.xml output.html

This is meant to be a simple one-page documentation generator, yet aiming to aid as much as possible on the work required to create documentations that fit the scope, in a quick painless manner.

This is not a tool to automatically generate documentation from source code.

[Demo and Documentation](https://madprops.github.io/Doctor/)

# Changelog

>v1.1.1: 

&lt;code&gt; is now &lt;xcodex&gt; to avoid problems when using &lt;code&gt;, which is a standard tag, inside a code sample.

Changed the code sample style.

Parsing errors should be more verbose now.

Encapsulated CSS creation in its own function.