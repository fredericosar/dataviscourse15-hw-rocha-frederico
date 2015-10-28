/** similar code at from http://stackoverflow.com/questions/18198252/d3-arc-gradient */

/* selected color */
var color;

function ColorPicker(div) {
    var self = this;

    self.color = d3.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255);
    self.out = true;

    var pie = d3.layout.pie().sort(null);
    var arc = d3.svg.arc().innerRadius(0).outerRadius(40);

    var data = d3.range(360).map(function(d, i){
    	return {
    		startAngle: i * (Math.PI / 180),
    		endAngle: (i + 2) * (Math.PI / 180),
    		fill: d3.hsl(i, 1, .5).toString()
    	};
    });

    /* color disk */
    d3.select(div)
    	.append("g")
    	.attr("transform", "translate(50, 50)")
    	.selectAll('path')
    	.data(data)
    	.enter()
    	.append('path').attr("d", arc)
    	.attr("stroke-width", 1)
    	.attr("stroke", function(d) { 
    		return d.fill;
    	})
    	.attr("fill", function(d) { 
    		return d.fill;
    	}).on("mouseover", function () {
            if(self.out){
                self.out = false;
                self.temp = self.color;
            }
            self.color = d3.select(this).attr("fill");
            updateTransferFunction();
	    }).on("mouseout", function () {
            if(!self.out){
                self.out = true;
                self.color = self.temp;
            }
            updateTransferFunction();
        }).on("click", function(d){
            self.temp = d3.select(this).attr("fill");
        });
};

ColorPicker.prototype.getColor = function () {
    var self = this;

    return self.color;
}