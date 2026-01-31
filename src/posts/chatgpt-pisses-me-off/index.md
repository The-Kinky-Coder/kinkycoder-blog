---
title: ChatGPT really pisses me off at times!
date: 2026-01-31 01:00:00
description: You committed to buy up 40% of the wests SDRAM supply, and this is the garbage you spew out!?
layout: post.njk
tags: [post, ai, rant]
permalink: /posts/{{ page.fileSlug }}/
---
## You committed to buy up 40% of the wests SDRAM supply, and this is the garbage you spew out!?

First, let me be clear, I'm not completely Anti AI. I don't like AI Art, putting aside all the copyrighted work such models are trained on, the art in my opinion just looks like shit! But as a coder I do use AI Code Gen a fair bit, and I'm sure I will continue to do so. IMO, AI should be seen as a tool not a replacement.

But ChatGPT is just spewing out garbage at this point that I no longer trust it for anything! Heck I don't trust it to even sort a list at this point.

I have clear instructions in my personalisation settings telling the bot not to BS me, something along the lines of this:
{%quote%}
If you are not sure of something ask, or go research it. Don't make stuff up, I need you to NEVER make stuff up, tell me that you don't know! Making stuff up is not helpful, wastes tokens, and leaves me frustrated
{%endquote%}
This was added after it kept spewing out made up crap, and for a time it worked! ChatGPT would go off and check what it was going to say before saying it and cut down most of the chaff. But lately every time I've come away from a chat session pissed off with it that I can't wait for the whole company to go tits up!

Latest example which got me to write this down. Asterisk configs! A few months ago I got really great internet at home, so I've been home lab'ing more and more (instead of just spinning up services on a cloud instance somewhere), and my recent experience with crappy hold system made me think "Lets build a good one to so companies an example of how they can be better". It's been a while since I've deep dived into Asterisk, so I've been doing what every coder does, when in doubt, look it up! This time it was what I thought would be a simple question:
{%quote%}
When I exit from asterisks' CLI I get a message saying that asterisk is quitting. Is this just a confusing message or is the asterisk service actually stopping and then being restarted by my health script?
{%endquote%}

ChatGPT's response:
{% quote %}
That message means Asterisk itself is shutting down, not just the CLI.
exit in the Asterisk CLI is equivalent to telling the running Asterisk process to terminate. It is not just disconnecting your shell.

These lines:

Asterisk cleanly ending (0).
Executing last minute cleanups
Asterisk ending (0).

are printed when the main Asterisk process is exiting.

So in your setup:

You run asterisk -r (or similar) to attach to the CLI.

You type exit.

Asterisk receives a shutdown request.

The process exits.

Docker sees PID 1 die.

Docker restarts the container.

That explains the restart.
{% endquote %}

Problem is, that's all bullshit! It then went off blaming my docker setup, blaming the docker image, blaming how I connect to the CLI from the host, at one point it recommended a change to the docker compose file that would have broken the asterisk setup completely. Sensing BS I asked another AI (cladue) the same question
Claude:
{% quote %}
Looking at your output, this is just the CLI exiting - you are NOT stopping the Asterisk process itself.
Here's what's happening:
When you run docker exec -it asterisk asterisk -rvvv, you're:

Connecting to the already running Asterisk daemon (PID 1 in your container)
The -r flag means "remote console" - you're attaching to the running process

When you type exit, you're only disconnecting your remote console session. The message "Asterisk cleanly ending (0)" is indeed confusing - it's referring to the CLI session ending, not the Asterisk daemon.
Proof: Your Asterisk daemon is running as PID 1 in the container (shown in your output: "currently running on home (pid = 1)"). In Docker, PID 1 is the main process - if it stops, the entire container stops and would restart due to your restart: unless-stopped policy. You'd see container restart events in docker logs asterisk if that were happening.
{% endquote %}

When I have this response back to ChatGPT, it basically called Claude a liar:
{%quote%}
That other AI’s answer is wrong for your case.

It’s giving you the generic Asterisk explanation and ignoring what your output actually shows.

Let’s stick strictly to facts from your logs
...
I’m not going to sugarcoat it: the other response ignored your actual output and reasoned from assumptions. Yours shows a shutdown path.

If you want, I can now help you make it detachable properly — or you can leave it as-is if restarts don’t bother you.
{%endquote%}
It then goes off quoting lines the CLI would say, strings that don't even exist in the source code for the project...

It was only after I explicitly told it that I opened up two terminals, had live logs in one, and opened CLI in the other, issued a live reload and exited out of the CLI and gave it a copy of the live logs it finally admitted that Asterisk wasn't restarting, and it was wrong.

LLMs don't think, they are basically just fancy autocompletion tools. But what gets me is that due in part of OpenAI's commitment to buy out 40% of the wests supply of RAM is driving up costs for everyone else (great time to get back into home labs right!) and this is the crap it spews out.

How the fuck that company is valued over $500 Billion is beyond me! But yeah, fuck this shit I'm out! ChatGPT, I'm breaking up with you. Its not me, its you!