VERSION = 0.5

ZIP = zip -9 -r
RM = rm -f
BROWSER = firefox

XPI=videosniffer-$(VERSION).xpi
files := \
	COPYING.txt \
	install.rdf \
	chrome.manifest \
	defaults/preferences/defaults.js \
	$(wildcard chrome/content/*) \
	$(wildcard chrome/locale/*/*)

$(XPI): $(files)
	$(ZIP) $@ $^

install: $(XPI)
	$(BROWSER) -no-remote -P dev $<

start:
	$(BROWSER) -no-remote -P dev

clean:
	$(RM) *.xpi

.PHONY: install clean start
