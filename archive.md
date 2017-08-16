---
layout: page
title: Archive
---

## Blog Posts

{% for post in site.posts %}
  * {{ post.date | date_to_string }} &raquo; [ {{ post.title }} ]({{ post.url }})
	<ul class="tags">
		{% for tag in post.tags %}
		<li><a href="{{ "/" | relative_url }}tags#{{tag}}" class="tag">{{ tag }}</a></li>
		{% endfor %}
	</ul>
{% endfor %}