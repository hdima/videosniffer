VERSION = 0.1

ZIP = zip -9 -r
CD = cd
RM = rm -f
BROWSER = firefox

videosniffer-$(VERSION).xpi: install.rdf chrome/videosniffer.jar
	$(ZIP) $@ install.rdf chrome/videosniffer.jar

chrome/videosniffer.jar: chrome/content/* chrome/locale/en/*
	$(CD) chrome; $(ZIP) videosniffer.jar content locale


install: videosniffer-$(VERSION).xpi
	$(BROWSER) $<

clean-chrome:
	$(RM) chrome/videosniffer.jar

clean-xpi:
	$(RM) videosniffer-$(VERSION).xpi

clean: clean-xpi clean-chrome

.PHONY: install clean clean-chrome clean-xpi
