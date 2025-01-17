/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as path from "path";
import { chromeConnection, utils as coreUtils } from "vscode-chrome-debug-core";

const WIN_APPDATA = process.env.LOCALAPPDATA || "/";

const DEFAULT_CHROME_PATH = {
	LINUX: "/usr/bin/google-chrome",
	OSX: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	WIN: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
	WIN_LOCALAPPDATA: path.join(
		WIN_APPDATA,
		"Google\\Chrome\\Application\\chrome.exe",
	),
	WINx86: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
};

export function getBrowserPath(): string {
	const platform = coreUtils.getPlatform();

	if (platform === coreUtils.Platform.OSX) {
		return coreUtils.existsSync(DEFAULT_CHROME_PATH.OSX)
			? DEFAULT_CHROME_PATH.OSX
			: null;
	} else if (platform === coreUtils.Platform.Windows) {
		if (coreUtils.existsSync(DEFAULT_CHROME_PATH.WINx86)) {
			return DEFAULT_CHROME_PATH.WINx86;
		} else if (coreUtils.existsSync(DEFAULT_CHROME_PATH.WIN)) {
			return DEFAULT_CHROME_PATH.WIN;
		} else if (coreUtils.existsSync(DEFAULT_CHROME_PATH.WIN_LOCALAPPDATA)) {
			return DEFAULT_CHROME_PATH.WIN_LOCALAPPDATA;
		} else {
			return null;
		}
	} else {
		return coreUtils.existsSync(DEFAULT_CHROME_PATH.LINUX)
			? DEFAULT_CHROME_PATH.LINUX
			: null;
	}
}

export class DebounceHelper {
	private waitToken: any; // TS can't decide whether Timer or number...

	constructor(private timeoutMs: number) {}

	/**
	 * If not waiting already, call fn after the timeout
	 */
	public wait(fn: () => any): void {
		if (!this.waitToken) {
			this.waitToken = setTimeout(() => {
				this.waitToken = null;

				fn();
			}, this.timeoutMs);
		}
	}

	/**
	 * If waiting for something, cancel it and call fn immediately
	 */
	public doAndCancel(fn: () => any): void {
		if (this.waitToken) {
			clearTimeout(this.waitToken);

			this.waitToken = null;
		}

		fn();
	}
}

export const getTargetFilter = (
	targetTypes?: string[],
): chromeConnection.ITargetFilter => {
	if (targetTypes) {
		return (target) =>
			target && (!target.type || targetTypes.indexOf(target.type) !== -1);
	}

	return () => true;
};

export const defaultTargetFilter = getTargetFilter(["page"]);
