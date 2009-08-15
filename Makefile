VERSION = 0.3

ZIP = zip -9 -r
RM = rm -f
BROWSER = firefox

videosniffer-$(VERSION).xpi: COPYING.txt install.rdf chrome.manifest chrome
	$(ZIP) $@ $^

install: videosniffer-$(VERSION).xpi
	$(BROWSER) -no-remote -P dev $<

start:
	$(BROWSER) -no-remote -P dev

clean:
	$(RM) videosniffer-$(VERSION).xpi

.PHONY: install clean start
