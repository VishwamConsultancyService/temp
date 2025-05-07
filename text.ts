default
{
	"logLevel": "ALL",
	"dataMask": {
		"mask": "sample",
		"maskConfig": "sample Config"
	}
}

{
	"logLevel": "ALL",
	"dataMask": {
		"mask": "true",
		"maskConfig": [{
				"tagToMask": "username",
				"maskChar": "*",
				"keepLastChars": 0
			},
			{
				"tagToMask": "password",
				"maskChar": "*",
				"keepLastChars": 0
			}
		]
	}
}
