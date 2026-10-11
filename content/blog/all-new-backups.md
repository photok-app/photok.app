---
# Copy this file to content/blog/<your-slug>.md and push.
# Files starting with "_" are ignored by the build.
# Note: this repo is public, so anything pushed (including drafts) is readable on GitHub.

title: All New Backups
description: Restoring a backup is now a guided full screen flow. Backups and restores are also more reliable than ever.
date: 2026-10-11                 # YYYY-MM-DD, publish date
author: Leon Latsch
draft: true
tags: [backup]
author_url: https://leonlatsch.dev

# Optional
# updated: 2026-10-20            # YYYY-MM-DD, shown as "Updated …" and used as lastmod
# image: https://photok.app/images/blog/all-new-backups.png   # cover image + social preview
# slug: custom-url-slug          # defaults to the file name -> /blog/<slug>/
---

## Feature creep made me do this

When Photok released in 2020, I had to squeese in some kind of backup feature before posting it to the Play Store.
At least that was what I belived.
I made it a simple ZIP archive with all the encrypted files and a JSON dump of the app database.

When it came to restoring backups, I had to realize that it's a complex flow that would need a compelx UI.
This is when I decided to let future me handle this problem after releasing `1.0.0`.

## 6 Years later

A lot has happened to Photok and its backups since then. Under the hood, the backup restoration was updated quite often.

Videos were introduced, albums were added and the internal file format changed twice.

With the big migration to Photok `2.0.0` most bugs with the backup system have been uncovered, since every user had to go through the process once.

> Essentially a forced user test when I think about it. But it worked.

In terms of the user interface for restoring backups: **Nothing** has changed since 2020. Still the same dialog with the ever loading spinner. Topped of with a error message as precise at it can get: *Some elements could not get processed.*

Eventually I found the bravery to tackle this problem with the apps migration to Jetpack Compose. The restore backup UI was one of the last remaining pieces.
I decided: If im going to touch that thing, I make it good this time.
