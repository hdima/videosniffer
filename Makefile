VERSION = 0.2

ZIP = zip -9 -r
RM = rm -f
BROWSER = firefox

videosniffer-$(VERSION).xpi: install.rdf chrome.manifest chrome/content/* chrome/locale/*
	$(ZIP) $@ $^

install: videosniffer-$(VERSION).xpi
	$(BROWSER) -no-remote -P dev $<

clean:
	$(RM) videosniffer-$(VERSION).xpi

.PHONY: install clean
